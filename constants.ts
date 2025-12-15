import { Executive, ConnectionStatus, CorporateSection, Department, Division } from './types';

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

// ============================================================================
// ORGANIZATIONAL HIERARCHY: DIVISIONS
// Structure: Division → Department → Function
// This hierarchy supports enterprise-level organization with proper firewalling
// ============================================================================
export const DIVISIONS: Division[] = [
  // EXECUTIVE & GOVERNANCE (Strategy-heavy, centralized decision authority)
  {
    id: 'executive-governance',
    name: 'Executive & Governance',
    description: 'Executive leadership, strategy, investor relations, and government affairs',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
  },
  
  // INTELLIGENCE & DECISION SYSTEMS (NEW - Required for AI-driven execution)
  {
    id: 'intelligence',
    name: 'Intelligence & Decision Systems',
    description: 'Intelligence operations, decision support, forecasting, simulation, and cross-department synthesis',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
  },
  
  // TECHNOLOGY & ENGINEERING (Execution-heavy)
  {
    id: 'technology',
    name: 'Technology & Engineering',
    description: 'Software engineering, infrastructure, security, and emerging tech development',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // PRODUCT & DESIGN (Hybrid)
  {
    id: 'product-design',
    name: 'Product & Design',
    description: 'Product management, UX/UI design, and user research',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // REVENUE & GROWTH (Execution-heavy)
  {
    id: 'revenue-growth',
    name: 'Revenue & Growth',
    description: 'Sales, marketing, partnerships, and customer success',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // CONTENT & IP (Hybrid - Media & Entertainment conglomerate)
  {
    id: 'content-ip',
    name: 'Content & IP',
    description: 'Editorial, publishing, streaming, gaming, creator relations, and content acquisition',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // PHYSICAL OPERATIONS (Execution-heavy, consolidated umbrella)
  {
    id: 'physical-ops',
    name: 'Physical Operations',
    description: 'Facilities, manufacturing, supply chain, retail, hospitality, and live events',
    operationalMode: 'execution',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // WEB3 & DIGITAL ASSETS (Hybrid)
  {
    id: 'web3-digital',
    name: 'Web3 & Digital Assets',
    description: 'Blockchain engineering, tokenomics, smart contracts, and NFT operations',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
  },
  
  // LEGAL & RISK (Strategy-heavy)
  {
    id: 'legal-risk',
    name: 'Legal & Risk',
    description: 'Legal counsel, compliance, risk management, and data governance',
    operationalMode: 'strategy',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: true,
  },
  
  // PEOPLE & CULTURE (Hybrid)
  {
    id: 'people-culture',
    name: 'People & Culture',
    description: 'Human resources, recruiting, training, and workplace services',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // CORPORATE COMMUNICATIONS (Hybrid)
  {
    id: 'communications',
    name: 'Corporate Communications',
    description: 'Communications, public relations, and community management',
    operationalMode: 'hybrid',
    regulatoryStatus: 'standard',
    requiresFirewall: false,
    requiresAuditLog: false,
  },
  
  // ============================================================================
  // FIREWALLED REGULATED DIVISIONS
  // These divisions require structural isolation, permission-restriction,
  // audit logging, and separation from creative/growth teams
  // ============================================================================
  
  // FINANCE & TREASURY (REGULATED - Heavily regulated industry)
  {
    id: 'finance-treasury',
    name: 'Finance & Treasury',
    description: 'Financial planning, accounting, treasury, and investor relations',
    operationalMode: 'strategy',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
  },
  
  // CANNABIS OPERATIONS (HIGHLY REGULATED - Requires strict firewalling)
  {
    id: 'cannabis',
    name: 'Cannabis Operations',
    description: 'Cannabis cultivation, processing, compliance, licensing, and distribution',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
  },
  
  // MEDICAL & CLINICAL (HIGHLY REGULATED)
  {
    id: 'medical-clinical',
    name: 'Medical & Clinical',
    description: 'Medical operations, clinical services, and health compliance',
    operationalMode: 'execution',
    regulatoryStatus: 'highly-regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
  },
  
  // FOOD & BEVERAGE (REGULATED)
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Food and beverage operations, safety compliance, and distribution',
    operationalMode: 'execution',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
  },
  
  // GOVERNMENT & PUBLIC SECTOR (REGULATED)
  {
    id: 'government-public',
    name: 'Government & Public Sector',
    description: 'Government contracts, public sector services, and regulatory affairs',
    operationalMode: 'strategy',
    regulatoryStatus: 'regulated',
    requiresFirewall: true,
    requiresAuditLog: true,
  },
];

// ============================================================================
// COMPREHENSIVE DEPARTMENT DIRECTORY
// Organized by Division with proper hierarchy and function roll-ups
// ============================================================================
export const DEPARTMENTS: Department[] = [
  // ============================================================================
  // EXECUTIVE & GOVERNANCE DIVISION
  // ============================================================================
  { id: 'executive', name: 'Executive', description: 'C-Suite and executive leadership', category: 'Leadership', divisionId: 'executive-governance', operationalMode: 'strategy' },
  { id: 'strategy', name: 'Strategy', description: 'Strategic planning and business development', category: 'Leadership', divisionId: 'executive-governance', operationalMode: 'strategy' },
  { id: 'bizops', name: 'Business Operations', description: 'Cross-functional business operations', category: 'Leadership', divisionId: 'executive-governance', operationalMode: 'hybrid' },
  { id: 'investor-relations', name: 'Investor Relations', description: 'Investor communications and relations', category: 'Leadership', divisionId: 'executive-governance', operationalMode: 'strategy' },
  { id: 'government', name: 'Government Affairs', description: 'Government relations and policy engagement', category: 'Leadership', divisionId: 'executive-governance', operationalMode: 'strategy' },
  
  // ============================================================================
  // INTELLIGENCE & DECISION SYSTEMS DIVISION (NEW)
  // Cross-department synthesis function for AI-driven execution
  // ============================================================================
  { id: 'intelligence-ops', name: 'Intelligence Operations', description: 'Data-driven intelligence and operational insights', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'strategy' },
  { id: 'decision-support', name: 'Decision Support', description: 'Executive decision support systems and analysis', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'strategy' },
  { id: 'forecasting', name: 'Forecasting & Simulation', description: 'Predictive modeling, forecasting, and scenario simulation', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'strategy' },
  { id: 'ml-ai', name: 'ML/AI Engineering', description: 'Machine learning and AI model development', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'execution' },
  { id: 'data-engineering', name: 'Data Engineering', description: 'Data pipeline and infrastructure', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'execution' },
  { id: 'data-governance', name: 'Data Governance', description: 'Data governance, quality, and policy', category: 'Intelligence', divisionId: 'intelligence', operationalMode: 'strategy' },
  
  // ============================================================================
  // TECHNOLOGY & ENGINEERING DIVISION
  // ============================================================================
  { id: 'engineering', name: 'Engineering', description: 'Software engineering and architecture', category: 'Technology', divisionId: 'technology', operationalMode: 'execution' },
  { id: 'backend', name: 'Backend Engineering', description: 'Server-side development', category: 'Technology', divisionId: 'technology', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'engineering' },
  { id: 'frontend', name: 'Frontend Engineering', description: 'Client-side development', category: 'Technology', divisionId: 'technology', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'engineering' },
  { id: 'mobile', name: 'Mobile Engineering', description: 'Mobile app development', category: 'Technology', divisionId: 'technology', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'engineering' },
  { id: 'qa', name: 'Quality Assurance', description: 'Software testing and quality', category: 'Technology', divisionId: 'technology', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'engineering' },
  { id: 'security', name: 'Security', description: 'Information security and cybersecurity', category: 'Technology', divisionId: 'technology', operationalMode: 'execution' },
  { id: 'it', name: 'IT', description: 'IT infrastructure and support', category: 'Technology', divisionId: 'technology', operationalMode: 'execution' },
  { id: 'devops', name: 'DevOps', description: 'Development operations and infrastructure', category: 'Technology', divisionId: 'technology', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'engineering' },
  { id: 'r-and-d', name: 'R&D', description: 'Research and development', category: 'Technology', divisionId: 'technology', operationalMode: 'hybrid' },
  { id: 'vr-ar', name: 'VR/AR', description: 'Virtual and augmented reality', category: 'Technology', divisionId: 'technology', operationalMode: 'execution' },
  { id: 'hardware', name: 'Hardware', description: 'Hardware development', category: 'Technology', divisionId: 'technology', operationalMode: 'execution' },
  
  // ============================================================================
  // PRODUCT & DESIGN DIVISION
  // ============================================================================
  { id: 'product', name: 'Product', description: 'Product management and strategy', category: 'Product', divisionId: 'product-design', operationalMode: 'hybrid' },
  { id: 'design', name: 'Design', description: 'Design strategy and direction', category: 'Product', divisionId: 'product-design', operationalMode: 'hybrid' },
  { id: 'ux', name: 'UX Design', description: 'User experience design', category: 'Product', divisionId: 'product-design', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'design' },
  { id: 'ui', name: 'UI Design', description: 'User interface design', category: 'Product', divisionId: 'product-design', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'design' },
  
  // ============================================================================
  // REVENUE & GROWTH DIVISION
  // ============================================================================
  // Marketing Department (with rolled-up functions)
  { id: 'marketing', name: 'Marketing', description: 'Marketing strategy and brand management', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'hybrid' },
  { id: 'brand', name: 'Brand Marketing', description: 'Brand strategy and positioning', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'strategy', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'growth', name: 'Growth Marketing', description: 'Performance and growth marketing', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'content', name: 'Content Marketing', description: 'Content strategy and creation', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'seo', name: 'SEO', description: 'Search engine optimization', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'social', name: 'Social Media', description: 'Social media management', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'influencer', name: 'Influencer Marketing', description: 'Influencer and creator partnerships', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'ad-ops', name: 'Ad Operations', description: 'Advertising operations', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'programmatic', name: 'Programmatic', description: 'Programmatic advertising', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  { id: 'media-buying', name: 'Media Buying', description: 'Media planning and buying', category: 'Marketing', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'marketing' },
  
  // Sales Department (with rolled-up functions)
  { id: 'sales', name: 'Sales', description: 'Sales and revenue generation', category: 'Sales', divisionId: 'revenue-growth', operationalMode: 'execution' },
  { id: 'enterprise-sales', name: 'Enterprise Sales', description: 'Enterprise sales and accounts', category: 'Sales', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'sales' },
  { id: 'smb-sales', name: 'SMB Sales', description: 'Small and medium business sales', category: 'Sales', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'sales' },
  { id: 'partnerships', name: 'Partnerships', description: 'Business development and partnerships', category: 'Sales', divisionId: 'revenue-growth', operationalMode: 'hybrid' },
  
  // Customer Success Department (with rolled-up functions)
  { id: 'customer-success', name: 'Customer Success', description: 'Customer success and retention', category: 'Customer', divisionId: 'revenue-growth', operationalMode: 'execution' },
  { id: 'support', name: 'Customer Support', description: 'Customer support and service', category: 'Customer', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'customer-success' },
  { id: 'trust-safety', name: 'Trust & Safety', description: 'Platform trust and safety', category: 'Customer', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'customer-success' },
  { id: 'moderation', name: 'Moderation', description: 'Content moderation', category: 'Customer', divisionId: 'revenue-growth', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'trust-safety' },
  
  // E-commerce
  { id: 'ecommerce', name: 'E-commerce', description: 'E-commerce and online sales', category: 'Commerce', divisionId: 'revenue-growth', operationalMode: 'execution' },
  
  // ============================================================================
  // CONTENT & IP DIVISION (Media conglomerate hierarchy)
  // ============================================================================
  // Editorial & Publishing
  { id: 'editorial', name: 'Editorial', description: 'Editorial direction and content creation', category: 'Media', divisionId: 'content-ip', operationalMode: 'hybrid', isFunction: true, parentDepartmentId: 'publishing' },
  { id: 'publishing', name: 'Publishing Operations', description: 'Publishing strategy and operations', category: 'Media', divisionId: 'content-ip', operationalMode: 'hybrid' },
  { id: 'content-acquisition', name: 'Content Acquisition', description: 'Content licensing and acquisition', category: 'Media', divisionId: 'content-ip', operationalMode: 'strategy' },
  
  // Production & Distribution
  { id: 'audio-video', name: 'Audio/Video Production', description: 'Audio and video production', category: 'Media', divisionId: 'content-ip', operationalMode: 'execution' },
  { id: 'streaming', name: 'Streaming', description: 'Streaming and broadcast operations', category: 'Media', divisionId: 'content-ip', operationalMode: 'execution' },
  { id: 'localization', name: 'Localization', description: 'Internationalization and localization', category: 'Media', divisionId: 'content-ip', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'publishing' },
  
  // Gaming & Interactive
  { id: 'gaming', name: 'Gaming', description: 'Gaming and interactive entertainment', category: 'Media', divisionId: 'content-ip', operationalMode: 'hybrid' },
  { id: 'esports', name: 'Esports', description: 'Esports and competitive gaming', category: 'Media', divisionId: 'content-ip', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'gaming' },
  
  // Creator & Artist Relations
  { id: 'creator-relations', name: 'Creator Relations', description: 'Creator partnerships and management', category: 'Arts', divisionId: 'content-ip', operationalMode: 'hybrid' },
  { id: 'artist-relations', name: 'Artist Relations', description: 'Artist management and relations', category: 'Arts', divisionId: 'content-ip', operationalMode: 'hybrid', isFunction: true, parentDepartmentId: 'creator-relations' },
  { id: 'label-relations', name: 'Label Relations', description: 'Music label partnerships', category: 'Arts', divisionId: 'content-ip', operationalMode: 'strategy', isFunction: true, parentDepartmentId: 'creator-relations' },
  
  // Fashion & Apparel
  { id: 'fashion', name: 'Fashion & Apparel', description: 'Fashion and apparel design', category: 'Fashion', divisionId: 'content-ip', operationalMode: 'hybrid' },
  
  // ============================================================================
  // PHYSICAL OPERATIONS DIVISION (Consolidated umbrella)
  // ============================================================================
  { id: 'operations', name: 'Operations', description: 'Physical operations management', category: 'Operations', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'workplace', name: 'Workplace & Facilities', description: 'Office management and facilities', category: 'Operations', divisionId: 'physical-ops', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'operations' },
  { id: 'supply-chain', name: 'Supply Chain', description: 'Supply chain and logistics', category: 'Operations', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Manufacturing operations', category: 'Operations', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'retail', name: 'Retail', description: 'Retail store operations', category: 'Commerce', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'merchandising', name: 'Merchandising', description: 'Product merchandising', category: 'Commerce', divisionId: 'physical-ops', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'retail' },
  { id: 'hospitality', name: 'Hospitality', description: 'Hospitality services and operations', category: 'Services', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'live-events', name: 'Live Events', description: 'Live events and touring', category: 'Events', divisionId: 'physical-ops', operationalMode: 'execution' },
  { id: 'events', name: 'Events & Conferences', description: 'Corporate events and conferences', category: 'Events', divisionId: 'physical-ops', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'live-events' },
  { id: 'ticketing', name: 'Ticketing', description: 'Ticketing operations', category: 'Events', divisionId: 'physical-ops', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'live-events' },
  { id: 'venue-ops', name: 'Venue Operations', description: 'Venue management', category: 'Events', divisionId: 'physical-ops', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'live-events' },
  
  // ============================================================================
  // WEB3 & DIGITAL ASSETS DIVISION
  // ============================================================================
  { id: 'web3', name: 'Web3', description: 'Web3 strategy and development', category: 'Web3', divisionId: 'web3-digital', operationalMode: 'hybrid' },
  { id: 'blockchain-eng', name: 'Blockchain Engineering', description: 'Blockchain development', category: 'Web3', divisionId: 'web3-digital', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'web3' },
  { id: 'tokenomics', name: 'Tokenomics', description: 'Token economics and design', category: 'Web3', divisionId: 'web3-digital', operationalMode: 'strategy', isFunction: true, parentDepartmentId: 'web3' },
  { id: 'smart-contracts', name: 'Smart Contracts', description: 'Smart contract development', category: 'Web3', divisionId: 'web3-digital', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'web3' },
  { id: 'nft', name: 'NFT', description: 'NFT strategy and operations', category: 'Web3', divisionId: 'web3-digital', operationalMode: 'hybrid', isFunction: true, parentDepartmentId: 'web3' },
  
  // ============================================================================
  // LEGAL & RISK DIVISION
  // ============================================================================
  { id: 'legal', name: 'Legal', description: 'Legal counsel and contract management', category: 'Legal', divisionId: 'legal-risk', operationalMode: 'strategy' },
  { id: 'compliance', name: 'Compliance', description: 'Regulatory compliance and governance', category: 'Legal', divisionId: 'legal-risk', operationalMode: 'strategy' },
  { id: 'risk', name: 'Risk Management', description: 'Enterprise risk management', category: 'Legal', divisionId: 'legal-risk', operationalMode: 'strategy' },
  { id: 'privacy', name: 'Privacy', description: 'Data privacy and protection', category: 'Legal', divisionId: 'legal-risk', operationalMode: 'strategy' },
  { id: 'reg-affairs', name: 'Regulatory Affairs', description: 'Regulatory affairs and policy', category: 'Legal', divisionId: 'legal-risk', operationalMode: 'strategy' },
  
  // ============================================================================
  // PEOPLE & CULTURE DIVISION
  // ============================================================================
  { id: 'hr', name: 'Human Resources', description: 'HR operations and employee relations', category: 'People', divisionId: 'people-culture', operationalMode: 'hybrid' },
  { id: 'recruiting', name: 'Recruiting', description: 'Talent acquisition and recruitment', category: 'People', divisionId: 'people-culture', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'hr' },
  { id: 'training', name: 'Training & Development', description: 'Learning and professional development', category: 'People', divisionId: 'people-culture', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'hr' },
  
  // ============================================================================
  // CORPORATE COMMUNICATIONS DIVISION
  // ============================================================================
  { id: 'communications', name: 'Communications', description: 'Corporate communications strategy', category: 'Communications', divisionId: 'communications', operationalMode: 'hybrid' },
  { id: 'pr', name: 'Public Relations', description: 'Public relations and media', category: 'Communications', divisionId: 'communications', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'communications' },
  { id: 'community', name: 'Community', description: 'Community management', category: 'Communications', divisionId: 'communications', operationalMode: 'execution', isFunction: true, parentDepartmentId: 'communications' },
  
  // ============================================================================
  // FIREWALLED REGULATED DIVISIONS
  // Structurally isolated, permission-restricted, logged and auditable
  // ============================================================================
  
  // FINANCE & TREASURY (REGULATED)
  { id: 'finance', name: 'Finance', description: 'Financial planning and analysis', category: 'Finance', divisionId: 'finance-treasury', operationalMode: 'strategy', regulatoryStatus: 'regulated' },
  { id: 'accounting', name: 'Accounting', description: 'Accounting and financial reporting', category: 'Finance', divisionId: 'finance-treasury', operationalMode: 'execution', regulatoryStatus: 'regulated', isFunction: true, parentDepartmentId: 'finance' },
  { id: 'treasury', name: 'Treasury', description: 'Cash management and treasury operations', category: 'Finance', divisionId: 'finance-treasury', operationalMode: 'execution', regulatoryStatus: 'regulated', isFunction: true, parentDepartmentId: 'finance' },
  { id: 'procurement', name: 'Procurement', description: 'Vendor management and procurement', category: 'Finance', divisionId: 'finance-treasury', operationalMode: 'execution', regulatoryStatus: 'standard', isFunction: true, parentDepartmentId: 'finance' },
  
  // CANNABIS OPERATIONS (HIGHLY REGULATED - Firewalled)
  { id: 'cannabis-ops', name: 'Cannabis Operations', description: 'Cannabis business operations', category: 'Cannabis', divisionId: 'cannabis', operationalMode: 'execution', regulatoryStatus: 'highly-regulated' },
  { id: 'cannabis-compliance', name: 'Cannabis Compliance', description: 'Cannabis regulatory compliance', category: 'Cannabis', divisionId: 'cannabis', operationalMode: 'strategy', regulatoryStatus: 'highly-regulated', isFunction: true, parentDepartmentId: 'cannabis-ops' },
  { id: 'cannabis-licensing', name: 'Cannabis Licensing', description: 'Cannabis licensing and permits', category: 'Cannabis', divisionId: 'cannabis', operationalMode: 'strategy', regulatoryStatus: 'highly-regulated', isFunction: true, parentDepartmentId: 'cannabis-ops' },
  { id: 'labs', name: 'Labs & Testing', description: 'Laboratory testing', category: 'Cannabis', divisionId: 'cannabis', operationalMode: 'execution', regulatoryStatus: 'highly-regulated', isFunction: true, parentDepartmentId: 'cannabis-ops' },
  { id: 'quality-reg', name: 'Quality & Regulatory', description: 'Quality assurance and regulatory', category: 'Cannabis', divisionId: 'cannabis', operationalMode: 'strategy', regulatoryStatus: 'highly-regulated', isFunction: true, parentDepartmentId: 'cannabis-ops' },
  
  // MEDICAL & CLINICAL (HIGHLY REGULATED - Firewalled)
  { id: 'medical', name: 'Medical & Clinical', description: 'Medical and clinical operations', category: 'Medical', divisionId: 'medical-clinical', operationalMode: 'execution', regulatoryStatus: 'highly-regulated' },
  { id: 'health-wellness', name: 'Health & Wellness', description: 'Health and wellness services', category: 'Medical', divisionId: 'medical-clinical', operationalMode: 'execution', regulatoryStatus: 'regulated', isFunction: true, parentDepartmentId: 'medical' },
  
  // FOOD & BEVERAGE (REGULATED - Firewalled)
  { id: 'food-beverage', name: 'Food & Beverage', description: 'Food and beverage operations', category: 'Food', divisionId: 'food-beverage', operationalMode: 'execution', regulatoryStatus: 'regulated' },
  
  // GOVERNMENT & PUBLIC SECTOR (REGULATED - Firewalled)
  { id: 'government-services', name: 'Government Services', description: 'Government and public sector services', category: 'Government', divisionId: 'government-public', operationalMode: 'execution', regulatoryStatus: 'regulated' },
  { id: 'education', name: 'Education & EdTech', description: 'Education technology', category: 'Government', divisionId: 'government-public', operationalMode: 'hybrid', regulatoryStatus: 'standard', isFunction: true, parentDepartmentId: 'government-services' },
  
  // ============================================================================
  // VERTICAL MARKETS (Non-regulated specializations)
  // ============================================================================
  { id: 'sports-fitness', name: 'Sports & Fitness', description: 'Sports and fitness operations', category: 'Vertical', divisionId: 'content-ip', operationalMode: 'hybrid' },
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