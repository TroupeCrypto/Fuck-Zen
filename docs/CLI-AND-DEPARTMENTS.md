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

## Department Directory Structure

### Location
`/departments/`

### Overview
Comprehensive department structure covering all functional areas of modern startup, digital, tech, crypto, cannabis, art, music, publishing, and social media companies.

### Total Departments: 97+

### Department Categories

#### Executive & Leadership (4)
- `executive/` - C-Suite and executive leadership
- `operations/` - Business operations and efficiency
- `strategy/` - Strategic planning and development
- `bizops/` - Cross-functional business operations

#### Finance & Accounting (5)
- `finance/` - Financial planning and analysis
- `accounting/` - Financial reporting and accounting
- `treasury/` - Cash management and treasury
- `investor-relations/` - Investor communications
- `procurement/` - Vendor management and procurement

#### People & Culture (4)
- `hr/` - Human resources operations
- `recruiting/` - Talent acquisition
- `training/` - Learning and development
- `workplace/` - Facilities and workplace services

#### Legal & Compliance (5)
- `legal/` - Legal counsel and contracts
- `compliance/` - Regulatory compliance
- `risk/` - Risk management
- `privacy/` - Data privacy and protection
- `data-governance/` - Data governance and policy

#### Security & IT (3)
- `security/` - Information security
- `it/` - IT infrastructure and support
- `devops/` - Development operations

#### Engineering (8)
- `engineering/` - Software engineering
- `backend/` - Backend development
- `frontend/` - Frontend development
- `mobile/` - Mobile app development
- `data-engineering/` - Data pipelines and infrastructure
- `ml-ai/` - Machine learning and AI
- `qa/` - Quality assurance
- `r-and-d/` - Research and development

#### Product & Design (4)
- `product/` - Product management
- `design/` - Design strategy
- `ux/` - User experience design
- `ui/` - User interface design

#### Marketing (10)
- `marketing/` - Marketing strategy
- `brand/` - Brand marketing
- `growth/` - Growth and performance marketing
- `content/` - Content marketing
- `seo/` - Search engine optimization
- `social/` - Social media management
- `influencer/` - Influencer marketing
- `ad-ops/` - Ad operations
- `programmatic/` - Programmatic advertising
- `media-buying/` - Media planning and buying

#### Sales & Business Development (4)
- `sales/` - Sales operations
- `enterprise-sales/` - Enterprise accounts
- `smb-sales/` - Small/medium business sales
- `partnerships/` - Partnerships and BD

#### Customer Success (4)
- `customer-success/` - Customer success management
- `support/` - Customer support
- `trust-safety/` - Trust and safety
- `moderation/` - Content moderation

#### Communications (4)
- `communications/` - Corporate communications
- `pr/` - Public relations
- `community/` - Community management
- `events/` - Events and conferences

#### Web3 & Crypto (5)
- `web3/` - Web3 strategy and development
- `blockchain-eng/` - Blockchain engineering
- `tokenomics/` - Token economics
- `smart-contracts/` - Smart contract development
- `nft/` - NFT operations

#### Cannabis (8)
- `cannabis-ops/` - Cannabis operations
- `cannabis-compliance/` - Cannabis compliance
- `cannabis-licensing/` - Licensing and permits
- `supply-chain/` - Supply chain and logistics
- `manufacturing/` - Manufacturing operations
- `labs/` - Laboratory testing
- `quality-reg/` - Quality and regulatory
- `medical/` - Medical and clinical

#### Retail & E-commerce (4)
- `retail/` - Retail operations
- `ecommerce/` - E-commerce operations
- `merchandising/` - Product merchandising
- `food-beverage/` - Food and beverage

#### Media & Entertainment (7)
- `editorial/` - Editorial content
- `publishing/` - Publishing operations
- `content-acquisition/` - Content licensing
- `audio-video/` - Audio/video production
- `streaming/` - Streaming and broadcast
- `gaming/` - Gaming operations
- `esports/` - Esports operations

#### Music & Arts (6)
- `artist-relations/` - Artist management
- `label-relations/` - Music label partnerships
- `creator-relations/` - Creator partnerships
- `live-events/` - Live events and touring
- `ticketing/` - Ticketing operations
- `venue-ops/` - Venue management

#### Fashion & Apparel (1)
- `fashion/` - Fashion and apparel design

#### Emerging Technology (2)
- `vr-ar/` - VR/AR development
- `hardware/` - Hardware development

#### Hospitality & Services (1)
- `hospitality/` - Hospitality services

#### Localization (1)
- `localization/` - Internationalization and localization

#### Vertical-Specific (5)
- `government/` - Government and public sector
- `education/` - Education and EdTech
- `health-wellness/` - Health and wellness
- `sports-fitness/` - Sports and fitness
- `reg-affairs/` - Regulatory affairs

### Department Structure

Each department directory contains:
- `README.md` - Department description and responsibilities
  - **Scope**: High-level description of the department's purpose
  - **Responsibilities**: Key responsibilities and functions

### Usage in Chat System

The department structure integrates with the CLI chat system:
1. Departments are available in the target selector
2. Selecting a department targets all members of that department
3. Department data is sourced from `/constants.ts` (`DEPARTMENTS` array)

### Extending the Structure

To add a new department:
1. Create a new directory under `/departments/`
2. Add a `README.md` with scope and responsibilities
3. Add the department to the `DEPARTMENTS` array in `/constants.ts`
4. Department will automatically appear in the chat target selector

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
- `Department` - Department information

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
   - Department hierarchy
   - Role-based permissions
   - Department dashboards

4. **Enhanced UI**
   - Typing indicators
   - Read receipts
   - Online/offline status
   - Avatar images

5. **Analytics**
   - Message metrics
   - Response times
   - Department activity
   - Engagement tracking

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
