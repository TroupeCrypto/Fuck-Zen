# CLI and Department Structure Documentation

## Overview
This document describes the new Command Line Interface (CLI) component with chat capabilities and the comprehensive department directory structure.

---

## Command Line Interface Component

### Location
`/components/CommandLineInterface.tsx`

### Features

#### 1. Dual Mode Operation
The CLI supports two distinct modes:

- **Command Mode**: Traditional command execution for system operations
- **Chat Mode**: Interactive messaging with executives and departments

Toggle between modes using the mode selector buttons at the top of the interface.

#### 2. Chat Targeting System

##### Individual Targeting
Select specific executives to send targeted messages:
- Use the target selector to choose one or more executives
- Messages are delivered only to selected recipients
- Responses are contextual to the conversation

##### Department Targeting
Send messages to entire departments:
- Select one or more departments from the comprehensive list
- All members of selected departments receive the message
- Useful for cross-functional communications

##### Broadcast Mode
When no specific targets are selected:
- Messages are sent to all executives
- Used for company-wide announcements
- System-level notifications

#### 3. Target Selector Interface
- **Show/Hide Toggle**: Expand or collapse the target selection interface
- **Multi-select Support**: Select multiple executives and/or departments
- **Visual Indicators**: Selected targets are highlighted with colored badges
- **Clear All**: Quick reset of all selections

### Usage Examples

#### Command Mode Examples
```
> initiate expansion
> assign: 004 high Implement new feature
> status
> clear
```

#### Chat Mode Examples
```
💬 [To Engineering Dept] Need status update on API development
💬 [To JARVIS] Can you schedule a meeting?
💬 [Broadcast] All hands meeting at 3pm
```

### Integration Points

#### Props Interface
```typescript
interface CommandLineInterfaceProps {
  executives: Executive[];        // List of available executives
  logs: LogEntry[];               // System logs for display
  onSendCommand: (command: string) => void;  // Command handler
  commandInput: string;           // Current input value
  setCommandInput: (value: string) => void;  // Input setter
  pendingCommand: string | null;  // Pending confirmation command
}
```

#### Data Flow
1. User inputs text in the command/chat input field
2. Mode determines processing path:
   - **Command Mode**: Validates and executes system commands
   - **Chat Mode**: Creates chat message with selected targets
3. Messages are logged to the appropriate display area
4. Real-time updates scroll automatically

### Styling & Layout

#### Fixed-Height Container
The CLI uses a fixed-height container (`min-h-[18rem] max-h-[18rem]`) to:
- Prevent layout shifts during log updates
- Provide stable scrolling behavior
- Maintain consistent page layout
- Enable smooth auto-scrolling

#### Visual Themes
- **Command Mode**: Cyan/blue theme for technical operations
- **Chat Mode**: Purple theme for communication
- **Pending Commands**: Yellow theme for confirmations

---

## Organizational Hierarchy

### Structure Overview
The organization follows a three-tier hierarchy:
```
Division → Department → Function
```

This structure supports:
- Multiple business units
- Multiple revenue models
- Multiple regulatory regimes
- Digital + physical operations

### Classification System

#### Operational Mode
- **Strategy**: Strategy-heavy units focused on planning, decision-making, and direction
- **Execution**: Execution-heavy units focused on implementation and delivery
- **Hybrid**: Units that balance both strategic and execution responsibilities

#### Regulatory Status
- **Standard**: No special regulatory requirements
- **Regulated**: Subject to industry regulations requiring compliance monitoring
- **Highly Regulated**: Subject to strict regulatory oversight requiring firewalling, isolation, and audit logging

### Firewalled Divisions
The following divisions require structural isolation to ensure compliance:
- **Finance & Treasury** - Financial regulations compliance
- **Cannabis Operations** - Strict state/federal cannabis regulations
- **Medical & Clinical** - HIPAA and healthcare regulations
- **Food & Beverage** - FDA and food safety regulations
- **Government & Public Sector** - Government contract compliance

Firewalled divisions are:
- Structurally isolated from other divisions
- Permission-restricted for authorized personnel only
- Logged and auditable for compliance tracking
- Separated from creative and growth teams

---

## Division Directory

### Total Divisions: 16

#### Executive & Governance (Strategy-Heavy)
Centralized decision authority for:
- Executive leadership
- Strategic planning
- Investor relations
- Government affairs

#### Intelligence & Decision Systems (Strategy-Heavy) ⭐ NEW
Cross-department synthesis function for AI-driven execution:
- Intelligence Operations
- Decision Support
- Forecasting & Simulation
- ML/AI Engineering
- Data Engineering
- Data Governance

#### Technology & Engineering (Execution-Heavy)
Software development and infrastructure:
- Engineering (Backend, Frontend, Mobile, QA, DevOps)
- Security
- IT
- R&D
- VR/AR
- Hardware

#### Product & Design (Hybrid)
Product strategy and user experience:
- Product Management
- Design (UX, UI)

#### Revenue & Growth (Execution-Heavy)
Revenue generation and customer engagement:
- Marketing (Brand, Growth, Content, SEO, Social, Ad Ops, etc.)
- Sales (Enterprise, SMB)
- Partnerships
- Customer Success (Support, Trust & Safety, Moderation)
- E-commerce

#### Content & IP (Hybrid)
Media conglomerate operations:
- Publishing & Editorial
- Content Acquisition
- Audio/Video Production
- Streaming
- Gaming & Esports
- Creator & Artist Relations
- Fashion & Apparel

#### Physical Operations (Execution-Heavy)
Consolidated physical world operations:
- Operations Management
- Workplace & Facilities
- Supply Chain
- Manufacturing
- Retail & Merchandising
- Hospitality
- Live Events (Ticketing, Venue Ops)

#### Web3 & Digital Assets (Hybrid)
Blockchain and digital asset operations:
- Web3 Strategy
- Blockchain Engineering
- Tokenomics
- Smart Contracts
- NFT Operations

#### Legal & Risk (Strategy-Heavy)
Legal and compliance oversight:
- Legal Counsel
- Compliance
- Risk Management
- Privacy
- Regulatory Affairs

#### People & Culture (Hybrid)
Human resources operations:
- HR
- Recruiting
- Training & Development

#### Corporate Communications (Hybrid)
Communications strategy:
- Communications
- Public Relations
- Community Management

### Firewalled Regulated Divisions

#### Finance & Treasury (Regulated)
- Finance
- Accounting
- Treasury
- Procurement

#### Cannabis Operations (Highly Regulated)
- Cannabis Operations
- Cannabis Compliance
- Cannabis Licensing
- Labs & Testing
- Quality & Regulatory

#### Medical & Clinical (Highly Regulated)
- Medical & Clinical Operations
- Health & Wellness

#### Food & Beverage (Regulated)
- Food & Beverage Operations

#### Government & Public Sector (Regulated)
- Government Services
- Education & EdTech

---

## Department Directory Structure

### Location
`/departments/`

### Department Hierarchy

Each department now includes:
- `divisionId` - Parent division identifier
- `operationalMode` - Strategy, execution, or hybrid classification
- `regulatoryStatus` - Standard, regulated, or highly-regulated (optional)
- `isFunction` - Whether this is a sub-function that rolls up to a parent
- `parentDepartmentId` - Parent department for functions

### Function Roll-ups

The following are now functions under parent departments (not top-level):

| Function | Parent Department |
|----------|------------------|
| QA | Engineering |
| Backend Engineering | Engineering |
| Frontend Engineering | Engineering |
| Mobile Engineering | Engineering |
| DevOps | Engineering |
| UX Design | Design |
| UI Design | Design |
| Ad Operations | Marketing |
| Content Marketing | Marketing |
| SEO | Marketing |
| Social Media | Marketing |
| Trust & Safety | Customer Success |
| Moderation | Trust & Safety |
| Editorial | Publishing |
| Localization | Publishing |
| Esports | Gaming |

### Usage in Chat System

The department structure integrates with the CLI chat system:
1. Departments are available in the target selector
2. Selecting a department targets all members of that department
3. Department data is sourced from `/constants.ts` (`DEPARTMENTS` array)
4. Division data is available from `/constants.ts` (`DIVISIONS` array)

### Extending the Structure

To add a new department:
1. Create a new directory under `/departments/`
2. Add a `README.md` with scope and responsibilities
3. Add the department to the `DEPARTMENTS` array in `/constants.ts`
4. Specify the `divisionId` to assign to a division
5. Set `operationalMode` and `regulatoryStatus` as appropriate
6. If it's a sub-function, set `isFunction: true` and `parentDepartmentId`
7. Department will automatically appear in the chat target selector

To add a new division:
1. Add the division to the `DIVISIONS` array in `/constants.ts`
2. Specify `operationalMode`, `regulatoryStatus`, `requiresFirewall`, and `requiresAuditLog`
3. Update existing departments to reference the new division

---

## Layout Stabilization

### Problem Solved
Previous implementation caused page "twitching" as new log entries arrived, pushing content around and creating a poor user experience.

### Solution Implemented

#### Fixed-Height Containers
- Terminal and CLI components use fixed height (`h-72 min-h-[18rem] max-h-[18rem]`)
- Internal scrolling with `overflow-y-auto`
- Auto-scroll to bottom on new entries

#### Flexbox Layout
- Header: `flex-shrink-0` prevents compression
- Content area: `flex-1 min-h-0` enables proper scrolling
- Bottom gradient: `absolute` positioning for visual effect

#### CSS Classes
```css
.h-72          /* Fixed height: 18rem */
.min-h-[18rem] /* Minimum height constraint */
.max-h-[18rem] /* Maximum height constraint */
.flex-1        /* Flex grow for content area */
.min-h-0       /* Enable flex item scrolling */
.overflow-y-auto /* Enable vertical scrolling */
```

### Benefits
- No layout shifts during rapid log updates
- Stable page layout
- Smooth scrolling experience
- Consistent visual appearance
- Better performance with large log volumes

---

## Testing the New Features

### Manual Testing Steps

#### 1. Test Layout Stability
```bash
npm run dev
```
- Navigate to the landing page
- Observe the CLI area during initial boot sequence
- Verify page doesn't jump or reflow
- Check that log area scrolls internally

#### 2. Test Command Mode
- Enter commands in the CLI
- Try: `status`, `initiate expansion`, `assign: 002 high Test task`
- Verify confirmation prompts work correctly
- Check log output appears correctly

#### 3. Test Chat Mode
- Click "Chat Mode" button
- Click "Select" to show target selector
- Select individual executives
- Select departments
- Send a test message
- Verify message appears with correct formatting
- Check simulated response appears

#### 4. Test Department Targeting
- In Chat Mode, select multiple departments
- Send a message
- Verify all selected departments are displayed as targets
- Clear selections and verify they reset

---

## Technical Architecture

### Component Hierarchy
```
HomePage (app/page.tsx)
├── ExecutiveCard (multiple)
├── CommandLineInterface
│   ├── Mode Toggle
│   ├── Display Area (Logs or Chat)
│   ├── Target Selector (Chat Mode)
│   └── Input Form
├── FileViewer / StrategyMap
└── KTDConsole (overlay)
```

### State Management
- Local component state with React hooks
- Props drilling for shared state
- localStorage for task persistence
- No external state management library

### Type Safety
All components are fully typed with TypeScript:
- `Executive` - Executive data structure
- `LogEntry` - System log entries
- `ChatMessage` - Chat message structure
- `ChatTarget` - Message targeting information
- `Department` - Department information (extended with hierarchy)
- `Division` - Division information (new)
- `OperationalMode` - Strategy/execution/hybrid classification
- `RegulatoryStatus` - Standard/regulated/highly-regulated classification

---

## Future Enhancements

### Potential Improvements
1. **Real Backend Integration**
   - Connect to actual messaging backend
   - Real-time updates via WebSocket
   - Message persistence and history

2. **Advanced Chat Features**
   - Message reactions
   - Thread support
   - File attachments
   - Message search

3. **Department Management**
   - Dynamic department assignment
   - Division-based filtering
   - Role-based permissions with firewall enforcement
   - Department dashboards
   - Regulatory compliance tracking

4. **Enhanced UI**
   - Typing indicators
   - Read receipts
   - Online/offline status
   - Avatar images
   - Division-based color coding

5. **Analytics**
   - Message metrics
   - Response times
   - Department activity
   - Engagement tracking
   - Compliance audit reports

6. **Intelligence Integration**
   - Decision support dashboards
   - Forecasting visualizations
   - Cross-department synthesis reports
   - AI assignment recommendations

---

**Last Updated**: 2025-12-15
**Version**: 2.0.0
