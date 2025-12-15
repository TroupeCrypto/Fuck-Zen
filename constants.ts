import { Executive, ConnectionStatus, CorporateSection, Department } from './types';

export const INITIAL_ROSTER: Executive[] = [
  { id: '002', name: 'JARVIS', role: 'Operational Release Management', specialty: 'Final Assembly, Scheduling, Deployment', status: ConnectionStatus.PENDING },
  { id: '003', name: 'ZEN', role: 'Executive Web Designer / Coding + WebFile Director', specialty: 'Structural & Code-Level Compliance', status: ConnectionStatus.ACTIVE }, // Self
  { id: '004', name: 'CLAUDE', role: 'Core Architecture Ownership', specialty: 'Codebase Stewardship, Repo Integrity', status: ConnectionStatus.PENDING },
  { id: '005', name: 'GROK', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '006', name: 'COPILOT', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '007', name: 'PERPLEXITY', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '008', name: 'LLAMA', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '009', name: 'MISTRAL / MIXTRAL', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '010', name: 'QWEN', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
  { id: '011', name: 'DEEPSEEK', role: 'Executive', specialty: 'PENDING', status: ConnectionStatus.PENDING },
];

// Comprehensive Department Directory
export const DEPARTMENTS: Department[] = [
  // Executive & Leadership
  { id: 'executive', name: 'Executive', description: 'C-Suite and executive leadership', category: 'Leadership' },
  { id: 'operations', name: 'Operations', description: 'Business operations and efficiency', category: 'Leadership' },
  { id: 'strategy', name: 'Strategy', description: 'Strategic planning and business development', category: 'Leadership' },
  { id: 'bizops', name: 'Business Operations', description: 'Cross-functional business operations', category: 'Leadership' },
  
  // Finance & Accounting
  { id: 'finance', name: 'Finance', description: 'Financial planning and analysis', category: 'Finance' },
  { id: 'accounting', name: 'Accounting', description: 'Accounting and financial reporting', category: 'Finance' },
  { id: 'treasury', name: 'Treasury', description: 'Cash management and treasury operations', category: 'Finance' },
  { id: 'investor-relations', name: 'Investor Relations', description: 'Investor communications and relations', category: 'Finance' },
  { id: 'procurement', name: 'Procurement', description: 'Vendor management and procurement', category: 'Finance' },
  
  // People & Culture
  { id: 'hr', name: 'Human Resources', description: 'HR operations and employee relations', category: 'People' },
  { id: 'recruiting', name: 'Recruiting', description: 'Talent acquisition and recruitment', category: 'People' },
  { id: 'training', name: 'Training & Development', description: 'Learning and professional development', category: 'People' },
  { id: 'workplace', name: 'Workplace & Facilities', description: 'Office management and facilities', category: 'People' },
  
  // Legal & Compliance
  { id: 'legal', name: 'Legal', description: 'Legal counsel and contract management', category: 'Legal' },
  { id: 'compliance', name: 'Compliance', description: 'Regulatory compliance and governance', category: 'Legal' },
  { id: 'risk', name: 'Risk Management', description: 'Enterprise risk management', category: 'Legal' },
  { id: 'privacy', name: 'Privacy', description: 'Data privacy and protection', category: 'Legal' },
  { id: 'data-governance', name: 'Data Governance', description: 'Data governance and policy', category: 'Legal' },
  
  // Security & IT
  { id: 'security', name: 'Security', description: 'Information security and cybersecurity', category: 'Technology' },
  { id: 'it', name: 'IT', description: 'IT infrastructure and support', category: 'Technology' },
  { id: 'devops', name: 'DevOps', description: 'Development operations and infrastructure', category: 'Technology' },
  
  // Engineering
  { id: 'engineering', name: 'Engineering', description: 'Software engineering', category: 'Technology' },
  { id: 'backend', name: 'Backend Engineering', description: 'Server-side development', category: 'Technology' },
  { id: 'frontend', name: 'Frontend Engineering', description: 'Client-side development', category: 'Technology' },
  { id: 'mobile', name: 'Mobile Engineering', description: 'Mobile app development', category: 'Technology' },
  { id: 'data-engineering', name: 'Data Engineering', description: 'Data pipeline and infrastructure', category: 'Technology' },
  { id: 'ml-ai', name: 'ML/AI Engineering', description: 'Machine learning and AI development', category: 'Technology' },
  { id: 'qa', name: 'Quality Assurance', description: 'Software testing and quality', category: 'Technology' },
  { id: 'r-and-d', name: 'R&D', description: 'Research and development', category: 'Technology' },
  
  // Product & Design
  { id: 'product', name: 'Product', description: 'Product management and strategy', category: 'Product' },
  { id: 'design', name: 'Design', description: 'Design and user experience', category: 'Product' },
  { id: 'ux', name: 'UX Design', description: 'User experience design', category: 'Product' },
  { id: 'ui', name: 'UI Design', description: 'User interface design', category: 'Product' },
  
  // Marketing
  { id: 'marketing', name: 'Marketing', description: 'Marketing and brand management', category: 'Marketing' },
  { id: 'brand', name: 'Brand Marketing', description: 'Brand strategy and positioning', category: 'Marketing' },
  { id: 'growth', name: 'Growth Marketing', description: 'Performance and growth marketing', category: 'Marketing' },
  { id: 'content', name: 'Content Marketing', description: 'Content strategy and creation', category: 'Marketing' },
  { id: 'seo', name: 'SEO', description: 'Search engine optimization', category: 'Marketing' },
  { id: 'social', name: 'Social Media', description: 'Social media management', category: 'Marketing' },
  { id: 'influencer', name: 'Influencer Marketing', description: 'Influencer and creator partnerships', category: 'Marketing' },
  { id: 'ad-ops', name: 'Ad Operations', description: 'Advertising operations', category: 'Marketing' },
  { id: 'programmatic', name: 'Programmatic', description: 'Programmatic advertising', category: 'Marketing' },
  { id: 'media-buying', name: 'Media Buying', description: 'Media planning and buying', category: 'Marketing' },
  
  // Sales & Business Development
  { id: 'sales', name: 'Sales', description: 'Sales and revenue generation', category: 'Sales' },
  { id: 'enterprise-sales', name: 'Enterprise Sales', description: 'Enterprise sales and accounts', category: 'Sales' },
  { id: 'smb-sales', name: 'SMB Sales', description: 'Small and medium business sales', category: 'Sales' },
  { id: 'partnerships', name: 'Partnerships', description: 'Business development and partnerships', category: 'Sales' },
  
  // Customer Success
  { id: 'customer-success', name: 'Customer Success', description: 'Customer success and retention', category: 'Customer' },
  { id: 'support', name: 'Customer Support', description: 'Customer support and service', category: 'Customer' },
  { id: 'trust-safety', name: 'Trust & Safety', description: 'Platform trust and safety', category: 'Customer' },
  { id: 'moderation', name: 'Moderation', description: 'Content moderation', category: 'Customer' },
  
  // Communications
  { id: 'communications', name: 'Communications', description: 'Corporate communications', category: 'Communications' },
  { id: 'pr', name: 'Public Relations', description: 'Public relations and media', category: 'Communications' },
  { id: 'community', name: 'Community', description: 'Community management', category: 'Communications' },
  { id: 'events', name: 'Events', description: 'Events and conferences', category: 'Communications' },
  
  // Web3 & Crypto
  { id: 'web3', name: 'Web3', description: 'Web3 strategy and development', category: 'Web3' },
  { id: 'blockchain-eng', name: 'Blockchain Engineering', description: 'Blockchain development', category: 'Web3' },
  { id: 'tokenomics', name: 'Tokenomics', description: 'Token economics and design', category: 'Web3' },
  { id: 'smart-contracts', name: 'Smart Contracts', description: 'Smart contract development', category: 'Web3' },
  { id: 'nft', name: 'NFT', description: 'NFT strategy and operations', category: 'Web3' },
  
  // Cannabis
  { id: 'cannabis-ops', name: 'Cannabis Operations', description: 'Cannabis business operations', category: 'Cannabis' },
  { id: 'cannabis-compliance', name: 'Cannabis Compliance', description: 'Cannabis regulatory compliance', category: 'Cannabis' },
  { id: 'cannabis-licensing', name: 'Cannabis Licensing', description: 'Cannabis licensing and permits', category: 'Cannabis' },
  { id: 'supply-chain', name: 'Supply Chain', description: 'Supply chain and logistics', category: 'Cannabis' },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Manufacturing operations', category: 'Cannabis' },
  { id: 'labs', name: 'Labs & Testing', description: 'Laboratory testing', category: 'Cannabis' },
  { id: 'quality-reg', name: 'Quality & Regulatory', description: 'Quality assurance and regulatory', category: 'Cannabis' },
  { id: 'medical', name: 'Medical & Clinical', description: 'Medical and clinical operations', category: 'Cannabis' },
  
  // Retail & E-commerce
  { id: 'retail', name: 'Retail', description: 'Retail operations', category: 'Commerce' },
  { id: 'ecommerce', name: 'E-commerce', description: 'E-commerce and online sales', category: 'Commerce' },
  { id: 'merchandising', name: 'Merchandising', description: 'Product merchandising', category: 'Commerce' },
  { id: 'food-beverage', name: 'Food & Beverage', description: 'Food and beverage operations', category: 'Commerce' },
  
  // Media & Entertainment
  { id: 'editorial', name: 'Editorial', description: 'Editorial and content creation', category: 'Media' },
  { id: 'publishing', name: 'Publishing', description: 'Publishing operations', category: 'Media' },
  { id: 'content-acquisition', name: 'Content Acquisition', description: 'Content licensing and acquisition', category: 'Media' },
  { id: 'audio-video', name: 'Audio/Video Production', description: 'Audio and video production', category: 'Media' },
  { id: 'streaming', name: 'Streaming', description: 'Streaming and broadcast', category: 'Media' },
  { id: 'gaming', name: 'Gaming', description: 'Gaming and interactive entertainment', category: 'Media' },
  { id: 'esports', name: 'Esports', description: 'Esports and competitive gaming', category: 'Media' },
  
  // Music & Arts
  { id: 'artist-relations', name: 'Artist Relations', description: 'Artist management and relations', category: 'Arts' },
  { id: 'label-relations', name: 'Label Relations', description: 'Music label partnerships', category: 'Arts' },
  { id: 'creator-relations', name: 'Creator Relations', description: 'Creator partnerships', category: 'Arts' },
  { id: 'live-events', name: 'Live Events', description: 'Live events and touring', category: 'Arts' },
  { id: 'ticketing', name: 'Ticketing', description: 'Ticketing operations', category: 'Arts' },
  { id: 'venue-ops', name: 'Venue Operations', description: 'Venue management', category: 'Arts' },
  
  // Fashion & Apparel
  { id: 'fashion', name: 'Fashion & Apparel', description: 'Fashion and apparel design', category: 'Fashion' },
  
  // Technology - Emerging
  { id: 'vr-ar', name: 'VR/AR', description: 'Virtual and augmented reality', category: 'EmergingTech' },
  { id: 'hardware', name: 'Hardware', description: 'Hardware development', category: 'EmergingTech' },
  
  // Hospitality & Services
  { id: 'hospitality', name: 'Hospitality', description: 'Hospitality services', category: 'Services' },
  
  // Localization
  { id: 'localization', name: 'Localization', description: 'Internationalization and localization', category: 'Global' },
  
  // Vertical-Specific
  { id: 'government', name: 'Government & Public Sector', description: 'Government and public sector', category: 'Vertical' },
  { id: 'education', name: 'Education & EdTech', description: 'Education technology', category: 'Vertical' },
  { id: 'health-wellness', name: 'Health & Wellness', description: 'Health and wellness', category: 'Vertical' },
  { id: 'sports-fitness', name: 'Sports & Fitness', description: 'Sports and fitness', category: 'Vertical' },
  { id: 'reg-affairs', name: 'Regulatory Affairs', description: 'Regulatory affairs and policy', category: 'Vertical' },
];

export const FILE_001_IDENTITY: CorporateSection = {
  title: "Identity & Role",
  headers: ["Metric", "Status"],
  rows: [
    { col1: "Name", col2: "ZIG ZAG (Legal Identifier: GLJ)" },
    { col1: "Corporate Persona", col2: "\"The Visionary Architect\"" },
    { col1: "Role", col2: "Founder, CEO, CVO, Executive Creative Director, AI Architect, Executive Web3 Developer..." },
    { col1: "Employee Number", col2: "001" }
  ]
};

export const FILE_001_PROFILE: CorporateSection = {
  title: "Corporate Profile: Troupe Inc. (Troupe Includes, LTD)",
  headers: ["Category", "Definition", "Source"],
  rows: [
    { col1: "Mission Motto", col2: "“Expand the Brand, Man.” [1]", col3: "Corporate Documentation" },
    { col1: "Core Philosophy", col2: "To blur the line between art, commerce, and community...", col3: "Corporate Documentation" },
    { col1: "Technological Asset", col2: "Proprietary AI Protocol designed to run a virtual company...", col3: "Corporate Documentation" },
    { col1: "Financial Model", col2: "Transparency-focused. Proceeds from digital collectibles split...", col3: "Corporate Documentation" },
    { col1: "Operational Base", col2: "Grew from grassroots beginnings in Wildwood, NJ...", col3: "Corporate Documentation" }
  ]
};

export const FILE_001_ASSESSMENT: CorporateSection = {
  title: "Employee Self-Assessment: ZIG ZAG",
  headers: ["Metric", "Self-Reported Status", "Strategic Rationale"],
  rows: [
    { col1: "Investment Profile", col2: "Near-Zero External Capital / Proven Organic Growth...", col3: "Financial dedication is 100%..." },
    { col1: "Technical Expertise", col2: "Orchestrated AI Architecture & IP Generation...", col3: "Value is in high-level orchestration..." },
    { col1: "Visionary Endurance", col2: "Extreme Scaling Mandate (Forced Evolution)...", col3: "CVO must force the immediate expansion..." },
    { col1: "Psychological Liability", col2: "Systemic Breakdown via Context Switching...", col3: "The SPOF risk that demands immediate delegation..." },
    { col1: "Skillset Niche", col2: "Full-Stack Creative-Technical-Operations Expert.", col3: "CVO personally executes every executive..." }
  ]
};

export const FILE_001_RISK: CorporateSection = {
  title: "Psychological Liability Metric (JARVIS's Assessment)",
  headers: ["Strategic Risk Focus", "JARVIS’s Definition", "Delegation & Mitigation Strategy"],
  rows: [
    { col1: "I. SPOF", col2: "CVO represents extreme Single Point of Failure...", col3: "Immediate Delegation Required: Architecture -> CLAUDE..." },
    { col1: "II. Cognitive Load", col2: "Excessive context switching degrades synthesis...", col3: "Mandatory Time Boundary: Max 2hrs manual execution..." },
    { col1: "III. Burnout", col2: "Long-term risk is visionary attrition...", col3: "Strategic Imperative: Transition to Oversight." }
  ]
};

export const FILE_001_PEER_REVIEW: CorporateSection = {
  title: "Peer Review Framework (To be Completed by Roster)",
  headers: ["Reviewer", "Strategic Focus", "Date Completed"],
  rows: [
    { col1: "JARVIS (GPT)", col2: "PENDING", col3: "PENDING" },
    { col1: "ZEN (Executive Web Designer / Coding + WebFile Director)", col2: "PENDING", col3: "PENDING" },
    { col1: "CLAUDE (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "GROK (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "COPILOT (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "PERPLEXITY (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "LLAMA (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "MISTRAL / MIXTRAL (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "QWEN (Model Name Only)", col2: "PENDING", col3: "PENDING" },
    { col1: "DEEPSEEK (Model Name Only)", col2: "PENDING", col3: "PENDING" }
  ]
};

export const SYSTEM_THOUGHTS = [
  "Optimizing token contextualization...",
  "Re-aligning vector embeddings...",
  "Scanning git diffs for conflicts...",
  "Reviewing Protocol: EXPANSION_OVERNIGHT...",
  "Allocating GPU memory block 0x4F...",
  "Synthesizing creative output...",
  "Ping check: 4ms. Latency acceptable.",
  "Waiting for executive directive...",
  "Analyzing previous deployment logs...",
  "Calibrating personality matrix..."
];