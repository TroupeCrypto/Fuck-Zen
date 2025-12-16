#!/usr/bin/env node

/**
 * Jarvis PR Bridge - GitHub App-based PR automation
 * 
 * Creates PRs via GitHub App authentication without requiring a PAT.
 * Reads a JSON plan file and executes: branch creation, file writes, PR opening.
 * 
 * Usage: node tools/jarvis/pr-bridge.js ./tools/jarvis/change.json
 * 
 * Required env vars:
 * - GITHUB_APP_ID
 * - GITHUB_INSTALLATION_ID
 * - GITHUB_APP_PRIVATE_KEY (full PEM text)
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration & Constants
// ============================================================================

const BLOCKED_PATHS = [
  /^\.env/i,
  /secrets/i,
  /^\.github\/workflows\//
];

const ALLOWED_MODES = ['write'];

const GITHUB_API_BASE = 'https://api.github.com';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Make HTTPS request
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Jarvis-PR-Bridge',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Generate GitHub App JWT
 */
function generateJWT(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const payload = {
    iat: now - 60,
    exp: now + (10 * 60),
    iss: appId
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  const signature = sign.sign(privateKey);
  const encodedSignature = base64UrlEncode(signature);
  
  return `${signatureInput}.${encodedSignature}`;
}

function base64UrlEncode(data) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const base64 = buffer.toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Get installation access token
 */
async function getInstallationToken(jwt, installationId) {
  const url = `${GITHUB_API_BASE}/app/installations/${installationId}/access_tokens`;
  const response = await httpsRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  return response.token;
}

/**
 * Get reference (branch SHA)
 */
async function getRef(token, owner, repo, ref) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${ref}`;
  try {
    const response = await httpsRequest(url, {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    return response.object.sha;
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

/**
 * Create a new branch
 */
async function createBranch(token, owner, repo, branch, sha) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`;
  await httpsRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: {
      ref: `refs/heads/${branch}`,
      sha: sha
    }
  });
}

/**
 * Get file SHA (for updates)
 */
async function getFileSha(token, owner, repo, path, branch) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  try {
    const response = await httpsRequest(url, {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    return response.sha;
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

/**
 * Create or update file
 */
async function writeFile(token, owner, repo, filePath, content, branch, message) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`;
  const existingSha = await getFileSha(token, owner, repo, filePath, branch);
  
  const body = {
    message: message,
    content: Buffer.from(content).toString('base64'),
    branch: branch
  };
  
  if (existingSha) {
    body.sha = existingSha;
  }
  
  await httpsRequest(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: body
  });
}

/**
 * Create pull request
 */
async function createPR(token, owner, repo, title, body, head, base) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`;
  const response = await httpsRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: {
      title: title,
      body: body,
      head: head,
      base: base
    }
  });
  return response.html_url;
}

/**
 * Normalize and validate path
 */
function normalizePath(filePath) {
  // Normalize path separators and remove leading/trailing slashes
  let normalized = filePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  
  // Check against blocked patterns
  for (const pattern of BLOCKED_PATHS) {
    if (pattern.test(normalized)) {
      throw new Error(`Blocked path: ${filePath} (matches ${pattern})`);
    }
  }
  
  return normalized;
}

// ============================================================================
// Main Logic
// ============================================================================

async function main() {
  // Read environment variables
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_INSTALLATION_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  
  if (!appId || !installationId || !privateKey) {
    console.error('ERROR: Missing required environment variables');
    console.error('Required: GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY');
    process.exit(1);
  }
  
  // Read plan file from argv
  const planPath = process.argv[2];
  if (!planPath) {
    console.error('ERROR: Missing plan file path');
    console.error('Usage: node tools/jarvis/pr-bridge.js <plan.json>');
    process.exit(1);
  }
  
  let plan;
  try {
    const planContent = fs.readFileSync(planPath, 'utf8');
    plan = JSON.parse(planContent);
  } catch (error) {
    console.error(`ERROR: Failed to read plan file: ${error.message}`);
    process.exit(1);
  }
  
  // Validate plan schema
  const required = ['owner', 'repo', 'base', 'branch', 'title', 'body', 'commits'];
  for (const field of required) {
    if (!plan[field]) {
      console.error(`ERROR: Missing required field in plan: ${field}`);
      process.exit(1);
    }
  }
  
  if (!Array.isArray(plan.commits) || plan.commits.length === 0) {
    console.error('ERROR: Plan must contain at least one commit');
    process.exit(1);
  }
  
  console.log('🚀 Starting Jarvis PR Bridge...');
  console.log(`📋 Plan: ${path.basename(planPath)}`);
  console.log(`📦 Repo: ${plan.owner}/${plan.repo}`);
  console.log(`🌿 Branch: ${plan.branch} (from ${plan.base})`);
  
  try {
    // Step 1: Generate JWT
    console.log('\n🔐 Generating GitHub App JWT...');
    const jwt = generateJWT(appId, privateKey);
    
    // Step 2: Get installation access token
    console.log('🎫 Exchanging JWT for installation access token...');
    const token = await getInstallationToken(jwt, installationId);
    
    // Step 3: Get base branch SHA
    console.log(`📌 Getting ${plan.base} branch SHA...`);
    const baseSha = await getRef(token, plan.owner, plan.repo, plan.base);
    if (!baseSha) {
      throw new Error(`Base branch '${plan.base}' not found`);
    }
    console.log(`   SHA: ${baseSha.substring(0, 7)}`);
    
    // Step 4: Check if branch exists, create if not
    console.log(`\n🌱 Checking branch ${plan.branch}...`);
    const branchExists = await getRef(token, plan.owner, plan.repo, plan.branch);
    if (branchExists) {
      console.log('   ✓ Branch already exists');
    } else {
      console.log('   Creating new branch...');
      await createBranch(token, plan.owner, plan.repo, plan.branch, baseSha);
      console.log('   ✓ Branch created');
    }
    
    // Step 5: Process commits
    console.log(`\n📝 Processing ${plan.commits.length} file operation(s)...`);
    for (const commit of plan.commits) {
      // Validate commit
      if (!commit.path || !commit.mode || commit.content === undefined) {
        throw new Error('Invalid commit: must have path, mode, and content');
      }
      
      if (!ALLOWED_MODES.includes(commit.mode)) {
        throw new Error(`Invalid mode '${commit.mode}'. Allowed: ${ALLOWED_MODES.join(', ')}`);
      }
      
      // Normalize and validate path
      const normalizedPath = normalizePath(commit.path);
      console.log(`   📄 ${normalizedPath}`);
      
      // Write file
      const commitMessage = commit.message || `Update ${normalizedPath}`;
      await writeFile(
        token,
        plan.owner,
        plan.repo,
        normalizedPath,
        commit.content,
        plan.branch,
        commitMessage
      );
      console.log('      ✓ Written');
    }
    
    // Step 6: Create PR
    console.log('\n🔀 Creating pull request...');
    const prUrl = await createPR(
      token,
      plan.owner,
      plan.repo,
      plan.title,
      plan.body,
      plan.branch,
      plan.base
    );
    
    console.log('\n✅ SUCCESS!');
    console.log(`🔗 PR URL: ${prUrl}`);
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

// Run main function
main();
