<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Troupe Inc. - Executive War Room

This is the Tier 1 Executive Roundtable and Digital Headquarters for Troupe Inc., featuring an advanced AI-powered command line interface with chat capabilities and comprehensive organizational structure.

## Features

### 🎯 Command Line Interface with Chat
- **Dual Mode Operation**: Toggle between Command Mode (system operations) and Chat Mode (interactive messaging)
- **Multi-Party Chat**: Send messages to individual executives, entire departments, or broadcast to all
- **Target Selection**: Visual interface for selecting message recipients
- **Fixed-Height Layout**: Stable UI that prevents layout shifts during rapid updates

### 🏢 Comprehensive Department Structure
97+ departments covering all functional areas:
- Executive & Leadership
- Finance & Accounting
- Engineering & Technology
- Product & Design
- Marketing & Sales
- Web3 & Crypto
- Cannabis Operations
- Media & Entertainment
- And many more...

See [docs/CLI-AND-DEPARTMENTS.md](docs/CLI-AND-DEPARTMENTS.md) for complete documentation.

### 📊 Executive Management
- Real-time executive roster with connection status
- Task assignment and tracking
- Executive detail views with performance metrics
- Knowledge & Training Department (KTD) console

## Run Locally

**Prerequisites:** Node.js >= 18.0.0

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main landing page
│   └── api/               # API routes
├── components/            # React components
│   ├── CommandLineInterface.tsx  # New CLI with chat
│   ├── Terminal.tsx       # Original terminal component
│   ├── ExecutiveCard.tsx  # Executive roster cards
│   └── ...
├── departments/           # 97+ department directories
│   ├── executive/
│   ├── engineering/
│   ├── web3/
│   └── ...
├── docs/                  # Documentation
│   └── CLI-AND-DEPARTMENTS.md
├── constants.ts           # App constants and data
├── types.ts              # TypeScript type definitions
└── README.md             # This file
```

## Key Technologies

- **Next.js 14** - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **React 18** - UI library

## Documentation

- [CLI and Department Structure Documentation](docs/CLI-AND-DEPARTMENTS.md) - Comprehensive guide to the new CLI component and department structure
- Component-level documentation available in source files

## Usage Examples

### Command Mode
```
> status
> initiate expansion
> assign: 002 high Complete quarterly report
> clear
```

### Chat Mode
1. Click "Chat Mode" button
2. Click "Select" to choose targets
3. Select executives and/or departments
4. Type your message and send

## Development

```bash
# Run linter
npm run lint

# Build project
npm run build

# Start production server
npm start
```

## View in AI Studio

[View this app in AI Studio](https://ai.studio/apps/drive/1B1T4xjc2eX1aEpIeOlTIUbQkjS8u_h4T)

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
