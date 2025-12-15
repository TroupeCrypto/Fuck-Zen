/**
 * ORGANIZATION REGISTRY - Comprehensive Division/Department/SubDepartment structure
 * with AI bindings per PEER_REVIEW_FRAMEWORK_V2
 */

import { AUTONOMY_LEVELS } from './aiSystems.js';

/**
 * DIVISIONS - Top-level organizational units
 */
export const DIVISIONS = [
  {
    id: 'executive-governance',
    slug: 'executive-governance',
    name: 'Executive & Governance',
    description: 'Executive leadership, strategy, investor relations, and government affairs',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '004', // CLAUDE
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL
  },
  {
    id: 'intelligence',
    slug: 'intelligence',
    name: 'Intelligence & Decision Systems',
    description: 'Intelligence operations, decision support, forecasting, simulation, and cross-department synthesis',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
    primaryAI: '004', // CLAUDE
    secondaryAI: '011', // DEEPSEEK
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'technology',
    slug: 'technology',
    name: 'Technology & Engineering',
    description: 'Software engineering, infrastructure, security, and emerging tech development',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '004', // CLAUDE
    secondaryAI: '006', // COPILOT
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'product-design',
    slug: 'product-design',
    name: 'Product & Design',
    description: 'Product management, UX/UI design, and user research',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '003', // ZEN
    secondaryAI: '006', // COPILOT
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'revenue-growth',
    slug: 'revenue-growth',
    name: 'Revenue & Growth',
    description: 'Sales, marketing, partnerships, and customer success',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '003', // ZEN
    secondaryAI: '005', // GROK
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'content-ip',
    slug: 'content-ip',
    name: 'Content & IP',
    description: 'Editorial, publishing, streaming, gaming, creator relations, and content acquisition',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '003', // ZEN
    secondaryAI: '010', // QWEN (Localization)
    executionAI: '009', // MISTRAL
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'physical-ops',
    slug: 'physical-ops',
    name: 'Physical Operations',
    description: 'Facilities, manufacturing, supply chain, retail, hospitality, and live events',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '002', // JARVIS
    secondaryAI: '008', // LLAMA
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL
  },
  {
    id: 'web3-digital',
    slug: 'web3-digital',
    name: 'Web3 & Digital Assets',
    description: 'Blockchain engineering, tokenomics, smart contracts, and NFT operations',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
    primaryAI: '004', // CLAUDE
    secondaryAI: '011', // DEEPSEEK
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL
  },
  {
    id: 'legal-risk',
    slug: 'legal-risk',
    name: 'Legal & Risk',
    description: 'Legal counsel, compliance, risk management, and data governance',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
    primaryAI: '004', // CLAUDE
    secondaryAI: '007', // PERPLEXITY
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  },
  {
    id: 'people-culture',
    slug: 'people-culture',
    name: 'People & Culture',
    description: 'Human resources, recruiting, training, and workplace services',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '006', // COPILOT
    secondaryAI: '008', // LLAMA
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL
  },
  {
    id: 'communications',
    slug: 'communications',
    name: 'Corporate Communications',
    description: 'Communications, public relations, and community management',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
    primaryAI: '003', // ZEN
    secondaryAI: '005', // GROK
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.FULL
  },
  {
    id: 'finance-treasury',
    slug: 'finance-treasury',
    name: 'Finance & Treasury',
    description: 'Financial planning, accounting, treasury, and investor relations',
    operationalMode: 'strategy',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '004', // CLAUDE
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  },
  {
    id: 'cannabis',
    slug: 'cannabis',
    name: 'Cannabis Operations',
    description: 'Cannabis cultivation, processing, compliance, licensing, and distribution',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '004', // CLAUDE
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  },
  {
    id: 'medical-clinical',
    slug: 'medical-clinical',
    name: 'Medical & Clinical',
    description: 'Medical operations, clinical services, and health compliance',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '004', // CLAUDE
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  },
  {
    id: 'food-beverage',
    slug: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Food and beverage operations, safety compliance, and distribution',
    operationalMode: 'execution',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '008', // LLAMA
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  },
  {
    id: 'government-public',
    slug: 'government-public',
    name: 'Government & Public Sector',
    description: 'Government contracts, public sector services, and regulatory affairs',
    operationalMode: 'strategy',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
    primaryAI: '002', // JARVIS
    secondaryAI: '007', // PERPLEXITY
    executionAI: '006', // COPILOT
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY
  }
];

/**
 * DEPARTMENTS - Organized by Division with AI bindings
 */
export const DEPARTMENTS = [
  // ============================================================================
  // EXECUTIVE & GOVERNANCE DIVISION
  // ============================================================================
  {
    id: 'executive',
    slug: 'executive',
    name: 'Executive',
    description: 'C-Suite and executive leadership',
    category: 'Leadership',
    divisionId: 'executive-governance',
    operationalMode: 'strategy',
    primaryAI: '002',
    secondaryAI: '004',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'strategy',
    slug: 'strategy',
    name: 'Strategy',
    description: 'Strategic planning and business development',
    category: 'Leadership',
    divisionId: 'executive-governance',
    operationalMode: 'strategy',
    primaryAI: '005',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'bizops',
    slug: 'bizops',
    name: 'Business Operations',
    description: 'Cross-functional business operations',
    category: 'Leadership',
    divisionId: 'executive-governance',
    operationalMode: 'hybrid',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'investor-relations',
    slug: 'investor-relations',
    name: 'Investor Relations',
    description: 'Investor communications and relations',
    category: 'Leadership',
    divisionId: 'executive-governance',
    operationalMode: 'strategy',
    primaryAI: '002',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },
  {
    id: 'government',
    slug: 'government',
    name: 'Government Affairs',
    description: 'Government relations and policy engagement',
    category: 'Leadership',
    divisionId: 'executive-governance',
    operationalMode: 'strategy',
    primaryAI: '002',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },

  // ============================================================================
  // INTELLIGENCE & DECISION SYSTEMS DIVISION
  // ============================================================================
  {
    id: 'intelligence-ops',
    slug: 'intelligence-ops',
    name: 'Intelligence Operations',
    description: 'Data-driven intelligence and operational insights',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'decision-support',
    slug: 'decision-support',
    name: 'Decision Support',
    description: 'Executive decision support systems and analysis',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'forecasting',
    slug: 'forecasting',
    name: 'Forecasting & Simulation',
    description: 'Predictive modeling, forecasting, and scenario simulation',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'strategy',
    primaryAI: '011',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },
  {
    id: 'ml-ai',
    slug: 'ml-ai',
    name: 'ML/AI Engineering',
    description: 'Machine learning and AI model development',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'execution',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'data-engineering',
    slug: 'data-engineering',
    name: 'Data Engineering',
    description: 'Data pipeline and infrastructure',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'execution',
    primaryAI: '009',
    secondaryAI: '004',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'data-governance',
    slug: 'data-governance',
    name: 'Data Governance',
    description: 'Data governance, quality, and policy',
    category: 'Intelligence',
    divisionId: 'intelligence',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },

  // ============================================================================
  // TECHNOLOGY & ENGINEERING DIVISION
  // ============================================================================
  {
    id: 'engineering',
    slug: 'engineering',
    name: 'Engineering',
    description: 'Software engineering and architecture',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'execution',
    primaryAI: '004',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'security',
    slug: 'security',
    name: 'Security',
    description: 'Information security and cybersecurity',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'execution',
    primaryAI: '004',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },
  {
    id: 'it',
    slug: 'it',
    name: 'IT',
    description: 'IT infrastructure and support',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'execution',
    primaryAI: '008',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'r-and-d',
    slug: 'r-and-d',
    name: 'R&D',
    description: 'Research and development',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'hybrid',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'vr-ar',
    slug: 'vr-ar',
    name: 'VR/AR',
    description: 'Virtual and augmented reality',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'execution',
    primaryAI: '003',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'hardware',
    slug: 'hardware',
    name: 'Hardware',
    description: 'Hardware development',
    category: 'Technology',
    divisionId: 'technology',
    operationalMode: 'execution',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },

  // ============================================================================
  // PRODUCT & DESIGN DIVISION
  // ============================================================================
  {
    id: 'product',
    slug: 'product',
    name: 'Product',
    description: 'Product management and strategy',
    category: 'Product',
    divisionId: 'product-design',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'design',
    slug: 'design',
    name: 'Design',
    description: 'Design strategy and direction',
    category: 'Product',
    divisionId: 'product-design',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },

  // ============================================================================
  // REVENUE & GROWTH DIVISION
  // ============================================================================
  {
    id: 'marketing',
    slug: 'marketing',
    name: 'Marketing',
    description: 'Marketing strategy and brand management',
    category: 'Marketing',
    divisionId: 'revenue-growth',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'sales',
    slug: 'sales',
    name: 'Sales',
    description: 'Sales and revenue generation',
    category: 'Sales',
    divisionId: 'revenue-growth',
    operationalMode: 'execution',
    primaryAI: '005',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'partnerships',
    slug: 'partnerships',
    name: 'Partnerships',
    description: 'Business development and partnerships',
    category: 'Sales',
    divisionId: 'revenue-growth',
    operationalMode: 'hybrid',
    primaryAI: '005',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'customer-success',
    slug: 'customer-success',
    name: 'Customer Success',
    description: 'Customer success and retention',
    category: 'Customer',
    divisionId: 'revenue-growth',
    operationalMode: 'execution',
    primaryAI: '008',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '002'
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce',
    name: 'E-commerce',
    description: 'E-commerce and online sales',
    category: 'Commerce',
    divisionId: 'revenue-growth',
    operationalMode: 'execution',
    primaryAI: '003',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },

  // ============================================================================
  // CONTENT & IP DIVISION
  // ============================================================================
  {
    id: 'publishing',
    slug: 'publishing',
    name: 'Publishing Operations',
    description: 'Publishing strategy and operations',
    category: 'Media',
    divisionId: 'content-ip',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '010',
    executionAI: '009',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'content-acquisition',
    slug: 'content-acquisition',
    name: 'Content Acquisition',
    description: 'Content licensing and acquisition',
    category: 'Media',
    divisionId: 'content-ip',
    operationalMode: 'strategy',
    primaryAI: '005',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'audio-video',
    slug: 'audio-video',
    name: 'Audio/Video Production',
    description: 'Audio and video production',
    category: 'Media',
    divisionId: 'content-ip',
    operationalMode: 'execution',
    primaryAI: '003',
    secondaryAI: '009',
    executionAI: '009',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'streaming',
    slug: 'streaming',
    name: 'Streaming',
    description: 'Streaming and broadcast operations',
    category: 'Media',
    divisionId: 'content-ip',
    operationalMode: 'execution',
    primaryAI: '004',
    secondaryAI: '009',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '004'
  },
  {
    id: 'gaming',
    slug: 'gaming',
    name: 'Gaming',
    description: 'Gaming and interactive entertainment',
    category: 'Media',
    divisionId: 'content-ip',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },
  {
    id: 'creator-relations',
    slug: 'creator-relations',
    name: 'Creator Relations',
    description: 'Creator partnerships and management',
    category: 'Arts',
    divisionId: 'content-ip',
    operationalMode: 'hybrid',
    primaryAI: '005',
    secondaryAI: '003',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '003'
  },
  {
    id: 'fashion',
    slug: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Fashion and apparel design',
    category: 'Fashion',
    divisionId: 'content-ip',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },

  // ============================================================================
  // PHYSICAL OPERATIONS DIVISION
  // ============================================================================
  {
    id: 'operations',
    slug: 'operations',
    name: 'Operations',
    description: 'Physical operations management',
    category: 'Operations',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'supply-chain',
    slug: 'supply-chain',
    name: 'Supply Chain',
    description: 'Supply chain and logistics',
    category: 'Operations',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '009',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'manufacturing',
    slug: 'manufacturing',
    name: 'Manufacturing',
    description: 'Manufacturing operations',
    category: 'Operations',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'retail',
    slug: 'retail',
    name: 'Retail',
    description: 'Retail store operations',
    category: 'Commerce',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'hospitality',
    slug: 'hospitality',
    name: 'Hospitality',
    description: 'Hospitality services and operations',
    category: 'Services',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },
  {
    id: 'live-events',
    slug: 'live-events',
    name: 'Live Events',
    description: 'Live events and touring',
    category: 'Events',
    divisionId: 'physical-ops',
    operationalMode: 'execution',
    primaryAI: '002',
    secondaryAI: '003',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },

  // ============================================================================
  // WEB3 & DIGITAL ASSETS DIVISION
  // ============================================================================
  {
    id: 'web3',
    slug: 'web3',
    name: 'Web3',
    description: 'Web3 strategy and development',
    category: 'Web3',
    divisionId: 'web3-digital',
    operationalMode: 'hybrid',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },

  // ============================================================================
  // LEGAL & RISK DIVISION
  // ============================================================================
  {
    id: 'legal',
    slug: 'legal',
    name: 'Legal',
    description: 'Legal counsel and contract management',
    category: 'Legal',
    divisionId: 'legal-risk',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '004'
  },
  {
    id: 'compliance',
    slug: 'compliance',
    name: 'Compliance',
    description: 'Regulatory compliance and governance',
    category: 'Legal',
    divisionId: 'legal-risk',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '004'
  },
  {
    id: 'risk',
    slug: 'risk',
    name: 'Risk Management',
    description: 'Enterprise risk management',
    category: 'Legal',
    divisionId: 'legal-risk',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '004'
  },
  {
    id: 'privacy',
    slug: 'privacy',
    name: 'Privacy',
    description: 'Data privacy and protection',
    category: 'Legal',
    divisionId: 'legal-risk',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '004'
  },
  {
    id: 'reg-affairs',
    slug: 'reg-affairs',
    name: 'Regulatory Affairs',
    description: 'Regulatory affairs and policy',
    category: 'Legal',
    divisionId: 'legal-risk',
    operationalMode: 'strategy',
    primaryAI: '004',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '004'
  },

  // ============================================================================
  // PEOPLE & CULTURE DIVISION
  // ============================================================================
  {
    id: 'hr',
    slug: 'hr',
    name: 'Human Resources',
    description: 'HR operations and employee relations',
    category: 'People',
    divisionId: 'people-culture',
    operationalMode: 'hybrid',
    primaryAI: '008',
    secondaryAI: '006',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.PARTIAL,
    escalationTarget: '002'
  },

  // ============================================================================
  // CORPORATE COMMUNICATIONS DIVISION
  // ============================================================================
  {
    id: 'communications-dept',
    slug: 'communications-dept',
    name: 'Communications',
    description: 'Corporate communications strategy',
    category: 'Communications',
    divisionId: 'communications',
    operationalMode: 'hybrid',
    primaryAI: '003',
    secondaryAI: '005',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.FULL,
    escalationTarget: '003'
  },

  // ============================================================================
  // FINANCE & TREASURY DIVISION (REGULATED)
  // ============================================================================
  {
    id: 'finance',
    slug: 'finance',
    name: 'Finance',
    description: 'Financial planning and analysis',
    category: 'Finance',
    divisionId: 'finance-treasury',
    operationalMode: 'strategy',
    regulatoryStatus: 'regulated',
    primaryAI: '002',
    secondaryAI: '011',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },

  // ============================================================================
  // CANNABIS OPERATIONS DIVISION (HIGHLY REGULATED)
  // ============================================================================
  {
    id: 'cannabis-ops',
    slug: 'cannabis-ops',
    name: 'Cannabis Operations',
    description: 'Cannabis business operations',
    category: 'Cannabis',
    divisionId: 'cannabis',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    primaryAI: '002',
    secondaryAI: '004',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },

  // ============================================================================
  // MEDICAL & CLINICAL DIVISION (HIGHLY REGULATED)
  // ============================================================================
  {
    id: 'medical',
    slug: 'medical',
    name: 'Medical & Clinical',
    description: 'Medical and clinical operations',
    category: 'Medical',
    divisionId: 'medical-clinical',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    primaryAI: '002',
    secondaryAI: '004',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },

  // ============================================================================
  // FOOD & BEVERAGE DIVISION (REGULATED)
  // ============================================================================
  {
    id: 'food-beverage-dept',
    slug: 'food-beverage-dept',
    name: 'Food & Beverage',
    description: 'Food and beverage operations',
    category: 'Food',
    divisionId: 'food-beverage',
    operationalMode: 'execution',
    regulatoryStatus: 'regulated',
    primaryAI: '002',
    secondaryAI: '008',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  },

  // ============================================================================
  // GOVERNMENT & PUBLIC SECTOR DIVISION (REGULATED)
  // ============================================================================
  {
    id: 'government-services',
    slug: 'government-services',
    name: 'Government Services',
    description: 'Government and public sector services',
    category: 'Government',
    divisionId: 'government-public',
    operationalMode: 'execution',
    regulatoryStatus: 'regulated',
    primaryAI: '002',
    secondaryAI: '007',
    executionAI: '006',
    autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY,
    escalationTarget: '002'
  }
];

/**
 * SUB-DEPARTMENTS - Functions that roll up to parent departments
 */
export const SUB_DEPARTMENTS = [
  // Engineering Sub-Departments
  { id: 'backend', slug: 'backend', name: 'Backend Engineering', parentDepartmentId: 'engineering', divisionId: 'technology', primaryAI: '004', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'frontend', slug: 'frontend', name: 'Frontend Engineering', parentDepartmentId: 'engineering', divisionId: 'technology', primaryAI: '003', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'mobile', slug: 'mobile', name: 'Mobile Engineering', parentDepartmentId: 'engineering', divisionId: 'technology', primaryAI: '004', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'qa', slug: 'qa', name: 'Quality Assurance', parentDepartmentId: 'engineering', divisionId: 'technology', primaryAI: '004', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'devops', slug: 'devops', name: 'DevOps', parentDepartmentId: 'engineering', divisionId: 'technology', primaryAI: '004', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Design Sub-Departments
  { id: 'ux', slug: 'ux', name: 'UX Design', parentDepartmentId: 'design', divisionId: 'product-design', primaryAI: '003', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'ui', slug: 'ui', name: 'UI Design', parentDepartmentId: 'design', divisionId: 'product-design', primaryAI: '003', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Marketing Sub-Departments
  { id: 'brand', slug: 'brand', name: 'Brand Marketing', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '003', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'growth', slug: 'growth', name: 'Growth Marketing', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'content', slug: 'content', name: 'Content Marketing', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '003', secondaryAI: '009', executionAI: '009', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'seo', slug: 'seo', name: 'SEO', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'social', slug: 'social', name: 'Social Media', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '003', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'influencer', slug: 'influencer', name: 'Influencer Marketing', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '003', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'ad-ops', slug: 'ad-ops', name: 'Ad Operations', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '009', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'programmatic', slug: 'programmatic', name: 'Programmatic', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '009', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'media-buying', slug: 'media-buying', name: 'Media Buying', parentDepartmentId: 'marketing', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Sales Sub-Departments
  { id: 'enterprise-sales', slug: 'enterprise-sales', name: 'Enterprise Sales', parentDepartmentId: 'sales', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'smb-sales', slug: 'smb-sales', name: 'SMB Sales', parentDepartmentId: 'sales', divisionId: 'revenue-growth', primaryAI: '005', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Customer Success Sub-Departments
  { id: 'support', slug: 'support', name: 'Customer Support', parentDepartmentId: 'customer-success', divisionId: 'revenue-growth', primaryAI: '008', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'trust-safety', slug: 'trust-safety', name: 'Trust & Safety', parentDepartmentId: 'customer-success', divisionId: 'revenue-growth', primaryAI: '004', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'moderation', slug: 'moderation', name: 'Moderation', parentDepartmentId: 'trust-safety', divisionId: 'revenue-growth', primaryAI: '008', secondaryAI: '004', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Publishing Sub-Departments
  { id: 'editorial', slug: 'editorial', name: 'Editorial', parentDepartmentId: 'publishing', divisionId: 'content-ip', primaryAI: '003', secondaryAI: '010', executionAI: '009', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'localization', slug: 'localization', name: 'Localization', parentDepartmentId: 'publishing', divisionId: 'content-ip', primaryAI: '010', secondaryAI: '009', executionAI: '009', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Gaming Sub-Departments
  { id: 'esports', slug: 'esports', name: 'Esports', parentDepartmentId: 'gaming', divisionId: 'content-ip', primaryAI: '003', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Creator Relations Sub-Departments
  { id: 'artist-relations', slug: 'artist-relations', name: 'Artist Relations', parentDepartmentId: 'creator-relations', divisionId: 'content-ip', primaryAI: '005', secondaryAI: '003', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'label-relations', slug: 'label-relations', name: 'Label Relations', parentDepartmentId: 'creator-relations', divisionId: 'content-ip', primaryAI: '005', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Operations Sub-Departments
  { id: 'workplace', slug: 'workplace', name: 'Workplace & Facilities', parentDepartmentId: 'operations', divisionId: 'physical-ops', primaryAI: '008', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Retail Sub-Departments
  { id: 'merchandising', slug: 'merchandising', name: 'Merchandising', parentDepartmentId: 'retail', divisionId: 'physical-ops', primaryAI: '003', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Live Events Sub-Departments
  { id: 'events', slug: 'events', name: 'Events & Conferences', parentDepartmentId: 'live-events', divisionId: 'physical-ops', primaryAI: '002', secondaryAI: '003', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'ticketing', slug: 'ticketing', name: 'Ticketing', parentDepartmentId: 'live-events', divisionId: 'physical-ops', primaryAI: '002', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'venue-ops', slug: 'venue-ops', name: 'Venue Operations', parentDepartmentId: 'live-events', divisionId: 'physical-ops', primaryAI: '002', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Web3 Sub-Departments
  { id: 'blockchain-eng', slug: 'blockchain-eng', name: 'Blockchain Engineering', parentDepartmentId: 'web3', divisionId: 'web3-digital', primaryAI: '004', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'tokenomics', slug: 'tokenomics', name: 'Tokenomics', parentDepartmentId: 'web3', divisionId: 'web3-digital', primaryAI: '011', secondaryAI: '004', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'smart-contracts', slug: 'smart-contracts', name: 'Smart Contracts', parentDepartmentId: 'web3', divisionId: 'web3-digital', primaryAI: '004', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },
  { id: 'nft', slug: 'nft', name: 'NFT', parentDepartmentId: 'web3', divisionId: 'web3-digital', primaryAI: '003', secondaryAI: '004', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Finance Sub-Departments
  { id: 'accounting', slug: 'accounting', name: 'Accounting', parentDepartmentId: 'finance', divisionId: 'finance-treasury', primaryAI: '002', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'regulated' },
  { id: 'treasury', slug: 'treasury', name: 'Treasury', parentDepartmentId: 'finance', divisionId: 'finance-treasury', primaryAI: '002', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'regulated' },
  { id: 'procurement', slug: 'procurement', name: 'Procurement', parentDepartmentId: 'finance', divisionId: 'finance-treasury', primaryAI: '002', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL },

  // Cannabis Sub-Departments
  { id: 'cannabis-compliance', slug: 'cannabis-compliance', name: 'Cannabis Compliance', parentDepartmentId: 'cannabis-ops', divisionId: 'cannabis', primaryAI: '004', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'highly-regulated' },
  { id: 'cannabis-licensing', slug: 'cannabis-licensing', name: 'Cannabis Licensing', parentDepartmentId: 'cannabis-ops', divisionId: 'cannabis', primaryAI: '002', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'highly-regulated' },
  { id: 'labs', slug: 'labs', name: 'Labs & Testing', parentDepartmentId: 'cannabis-ops', divisionId: 'cannabis', primaryAI: '004', secondaryAI: '011', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'highly-regulated' },
  { id: 'quality-reg', slug: 'quality-reg', name: 'Quality & Regulatory', parentDepartmentId: 'cannabis-ops', divisionId: 'cannabis', primaryAI: '004', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'highly-regulated' },

  // Medical Sub-Departments
  { id: 'health-wellness', slug: 'health-wellness', name: 'Health & Wellness', parentDepartmentId: 'medical', divisionId: 'medical-clinical', primaryAI: '002', secondaryAI: '007', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.ASSIST_ONLY, regulatoryStatus: 'regulated' },

  // HR Sub-Departments
  { id: 'recruiting', slug: 'recruiting', name: 'Recruiting', parentDepartmentId: 'hr', divisionId: 'people-culture', primaryAI: '008', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'training', slug: 'training', name: 'Training & Development', parentDepartmentId: 'hr', divisionId: 'people-culture', primaryAI: '008', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Communications Sub-Departments
  { id: 'pr', slug: 'pr', name: 'Public Relations', parentDepartmentId: 'communications-dept', divisionId: 'communications', primaryAI: '003', secondaryAI: '005', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },
  { id: 'community', slug: 'community', name: 'Community', parentDepartmentId: 'communications-dept', divisionId: 'communications', primaryAI: '003', secondaryAI: '008', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.FULL },

  // Government Sub-Departments
  { id: 'education', slug: 'education', name: 'Education & EdTech', parentDepartmentId: 'government-services', divisionId: 'government-public', primaryAI: '007', secondaryAI: '006', executionAI: '006', autonomyLevel: AUTONOMY_LEVELS.PARTIAL }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get division by ID or slug
 */
export function getDivision(idOrSlug) {
  return DIVISIONS.find(d => d.id === idOrSlug || d.slug === idOrSlug) || null;
}

/**
 * Get department by ID or slug
 */
export function getDepartment(idOrSlug) {
  return DEPARTMENTS.find(d => d.id === idOrSlug || d.slug === idOrSlug) || null;
}

/**
 * Get sub-department by ID or slug
 */
export function getSubDepartment(idOrSlug) {
  return SUB_DEPARTMENTS.find(s => s.id === idOrSlug || s.slug === idOrSlug) || null;
}

/**
 * Get all departments for a division
 */
export function getDepartmentsByDivision(divisionId) {
  return DEPARTMENTS.filter(d => d.divisionId === divisionId);
}

/**
 * Get all sub-departments for a department
 */
export function getSubDepartmentsByDepartment(departmentId) {
  return SUB_DEPARTMENTS.filter(s => s.parentDepartmentId === departmentId);
}

/**
 * Get full org path for a department or sub-department
 */
export function getOrgPath(entityId) {
  const dept = getDepartment(entityId);
  if (dept) {
    const division = getDivision(dept.divisionId);
    return {
      division,
      department: dept,
      subDepartment: null
    };
  }
  
  const subDept = getSubDepartment(entityId);
  if (subDept) {
    const parentDept = getDepartment(subDept.parentDepartmentId);
    const division = getDivision(subDept.divisionId);
    return {
      division,
      department: parentDept,
      subDepartment: subDept
    };
  }
  
  return null;
}

/**
 * Get AI binding for any org entity
 */
export function getAIBinding(entityId) {
  const dept = getDepartment(entityId);
  if (dept) {
    return {
      primaryAI: dept.primaryAI,
      secondaryAI: dept.secondaryAI,
      executionAI: dept.executionAI,
      autonomyLevel: dept.autonomyLevel,
      escalationTarget: dept.escalationTarget
    };
  }
  
  const subDept = getSubDepartment(entityId);
  if (subDept) {
    return {
      primaryAI: subDept.primaryAI,
      secondaryAI: subDept.secondaryAI,
      executionAI: subDept.executionAI,
      autonomyLevel: subDept.autonomyLevel,
      escalationTarget: subDept.escalationTarget || getDepartment(subDept.parentDepartmentId)?.escalationTarget
    };
  }
  
  const division = getDivision(entityId);
  if (division) {
    return {
      primaryAI: division.primaryAI,
      secondaryAI: division.secondaryAI,
      executionAI: division.executionAI,
      autonomyLevel: division.autonomyLevel,
      escalationTarget: '002' // Always JARVIS for divisions
    };
  }
  
  return null;
}

/**
 * Build complete org tree structure
 */
export function buildOrgTree() {
  return DIVISIONS.map(division => ({
    ...division,
    departments: getDepartmentsByDivision(division.id).map(dept => ({
      ...dept,
      subDepartments: getSubDepartmentsByDepartment(dept.id)
    }))
  }));
}

export default {
  DIVISIONS,
  DEPARTMENTS,
  SUB_DEPARTMENTS,
  getDivision,
  getDepartment,
  getSubDepartment,
  getDepartmentsByDivision,
  getSubDepartmentsByDepartment,
  getOrgPath,
  getAIBinding,
  buildOrgTree
};
