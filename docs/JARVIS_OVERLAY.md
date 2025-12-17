# Jarvis Chat Overlay Documentation

## Overview

The Jarvis Chat Overlay is a site-wide persistent chat interface that provides multiple features including chat, system scopes, notifications, and a music player. It's accessible from any page via a minimized "J" launcher button in the bottom-right corner.

## Features

### 1. Chat Tab
- **Real-time messaging** with Jarvis AI assistant
- **Command Mode**: Type `/` to activate command mode for system operations
- **Typing Indicator**: Visual feedback when Jarvis is processing
- **Message History**: All messages are preserved during the session

### 2. Scopes Tab
- Displays connected executives and their status
- Shows real-time connection state for each executive
- Provides quick overview of system components

### 3. Notifications/Alerts Tab
- Centralized notification system
- **Badge Counter**: Shows unread notification count on the J launcher
- Mark notifications as read by clicking them
- Persists across sessions using localStorage

### 4. Music Tab
- **Local File Upload**: Upload audio files from your device
- **Playlist Management**: View and manage uploaded tracks
- **Rich Metadata**: Displays artwork, artist, album, and title
- **Audio Controls**: Play/pause functionality with now-playing display
- **IndexedDB Persistence**: All music and metadata persists across sessions

## Usage

### Opening the Overlay
1. Click the **"J" button** in the bottom-right corner
2. The overlay will expand to show the full interface
3. On mobile, it appears as a bottom-sheet that can be swiped down to close

### Uploading Music
1. Open the overlay and navigate to the **Music** tab
2. Click the **Upload** button
3. Select audio files from your device
4. Files are automatically saved to IndexedDB for persistence

### Command Mode
1. In the Chat tab, start your message with `/`
2. The interface will indicate "Command Mode" is active
3. Send system commands to control various operations

### Mobile Support
- **Swipe Indicator**: A small bar at the top indicates swipe-to-close functionality
- **Responsive Design**: Adapts to mobile screen sizes
- **Bottom Sheet**: Opens from the bottom on mobile devices

## Technical Details

### State Management
- **React State**: For UI interactions and real-time updates
- **localStorage**: For notifications persistence
- **IndexedDB**: For music files and metadata

### Data Storage

#### IndexedDB Schema
```javascript
Database: JarvisDB (version 1)
Object Stores:
  - tracks: { id, title, artist, album, artwork, fileData }
  - playlists: { id, name, tracks[] }
```

#### localStorage Keys
- `jarvis-notifications`: JSON array of notification objects

### Components

#### JarvisOverlay
Main component that orchestrates all tabs and functionality.

**Props:**
- `executives` (optional): Array of executive objects to display in Scopes tab

**State:**
- `isOpen`: Controls overlay visibility
- `isMinimized`: Controls launcher state
- `activeTab`: Current active tab ('chat' | 'scopes' | 'notifications' | 'music')
- `messages`: Chat message history
- `notifications`: Notification list
- `tracks`: Music track list
- `currentTrack`: Currently playing track

## Styling

The overlay uses Tailwind CSS and matches the existing design system:
- Dark theme with gradient accents
- Blue/purple gradient for branding
- Responsive breakpoints for mobile/desktop
- Smooth transitions and animations

## Accessibility

- **ARIA labels**: All interactive elements have appropriate labels
- **Keyboard navigation**: Full keyboard support for all interactions
- **Focus management**: Proper focus handling when opening/closing
- **Screen reader support**: Semantic HTML structure

## Browser Compatibility

- Modern browsers with IndexedDB support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Voice input for chat
- Music streaming from external sources
- Playlist sharing
- Advanced notification filtering
- Multi-user chat support
- Integration with external messaging systems

## Troubleshooting

### Music files not persisting
- Check browser's IndexedDB support
- Verify storage quota isn't exceeded
- Check browser console for errors

### Overlay not appearing
- Check JavaScript console for errors
- Verify the component is included in the page layout
- Clear browser cache and reload

### Mobile swipe not working
- Ensure touch events are not being blocked
- Check if running on a touch-enabled device
- Verify CSS touch-action properties
