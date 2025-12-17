'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Target, Bell, Music, Send, Command } from 'lucide-react';

interface JarvisMessage {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  file?: File;
  url?: string;
}

interface JarvisOverlayProps {
  executives?: any[];
}

type TabType = 'chat' | 'scopes' | 'notifications' | 'music';

const JarvisOverlay: React.FC<JarvisOverlayProps> = ({ executives = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<JarvisMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize IndexedDB for music storage
  useEffect(() => {
    initIndexedDB();
    loadTracksFromDB();
    loadNotifications();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for command mode
  useEffect(() => {
    if (input.startsWith('/')) {
      setCommandMode(true);
    } else {
      setCommandMode(false);
    }
  }, [input]);

  const initIndexedDB = () => {
    if (typeof window === 'undefined') return;
    
    const request = indexedDB.open('JarvisDB', 1);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
    };
  };

  const saveTrackToDB = async (track: Track) => {
    if (typeof window === 'undefined') return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('JarvisDB', 1);
      
      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['tracks'], 'readwrite');
        const store = transaction.objectStore('tracks');
        
        // Convert File to base64 if exists
        if (track.file) {
          const reader = new FileReader();
          reader.onload = () => {
            const trackData = {
              ...track,
              fileData: reader.result
            };
            delete trackData.file;
            store.put(trackData);
          };
          reader.readAsDataURL(track.file);
        } else {
          store.put(track);
        }
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
      };
    });
  };

  const loadTracksFromDB = async () => {
    if (typeof window === 'undefined') return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('JarvisDB', 1);
      
      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['tracks'], 'readonly');
        const store = transaction.objectStore('tracks');
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
          const loadedTracks = getAll.result.map((t: any) => ({
            ...t,
            url: t.fileData
          }));
          setTracks(loadedTracks);
          resolve(loadedTracks);
        };
        
        getAll.onerror = () => reject(getAll.error);
      };
    });
  };

  const loadNotifications = () => {
    // Load from localStorage or generate sample notifications
    const stored = localStorage.getItem('jarvis-notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'System Update',
          message: 'Jarvis overlay initialized successfully',
          timestamp: new Date(),
          read: false
        }
      ];
      setNotifications(sampleNotifications);
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    localStorage.setItem('jarvis-notifications', JSON.stringify(notifs));
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: JarvisMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate Jarvis response
    setIsTyping(true);
    setTimeout(() => {
      const response: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        text: commandMode 
          ? `Command executed: ${input}`
          : `Processing your request: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`,
        sender: 'jarvis',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) continue;

      // Parse metadata (simplified - in production would use music-metadata library)
      const track: Track = {
        id: Date.now().toString() + i,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        file: file,
        url: URL.createObjectURL(file)
      };

      await saveTrackToDB(track);
      setTracks(prev => [...prev, track]);
    }
  };

  const playTrack = (track: Track) => {
    if (audioRef.current && track.url) {
      setCurrentTrack(track);
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mobile swipe to close
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isDownSwipe) {
      setIsOpen(false);
      setIsMinimized(true);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      {/* Floating J Launcher */}
      {isMinimized && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white font-bold text-2xl z-50 hover:scale-110"
          aria-label="Open Jarvis"
        >
          J
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Overlay Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setIsMinimized(true);
            }
          }}
        >
          <div 
            className="bg-gray-900 w-full md:w-[600px] md:max-h-[700px] h-[80vh] md:h-auto rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col border border-gray-700"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div>
                  <h2 className="text-white font-semibold">Jarvis</h2>
                  <p className="text-gray-400 text-xs">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(true);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  aria-label="Minimize"
                >
                  <span className="text-xl">−</span>
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(true);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mobile swipe indicator */}
            <div className="md:hidden flex justify-center py-2 border-b border-gray-800">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('scopes')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
                  activeTab === 'scopes' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Target size={18} />
                <span className="text-sm font-medium">Scopes</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors relative ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Bell size={18} />
                <span className="text-sm font-medium">Alerts</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
                  activeTab === 'music' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Music size={18} />
                <span className="text-sm font-medium">Music</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-200 rounded-2xl px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:100ms]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              {/* Scopes Tab */}
              {activeTab === 'scopes' && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold mb-3">System Scopes</h3>
                  {executives.length > 0 ? (
                    executives.map(exec => (
                      <div key={exec.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{exec.name}</p>
                            <p className="text-gray-400 text-sm">{exec.title}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            exec.status === 'active' ? 'bg-green-500' : 'bg-gray-600'
                          }`}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <Target size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No scopes available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold mb-3">Notifications</h3>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`rounded-lg p-3 cursor-pointer transition-colors ${
                          notif.read ? 'bg-gray-800' : 'bg-blue-900/30 border border-blue-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{notif.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {notif.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <Bell size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              )}

              {/* Music Tab */}
              {activeTab === 'music' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Music Library</h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {currentTrack && (
                    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-700">
                      <div className="flex items-center space-x-4">
                        {currentTrack.artwork ? (
                          <img src={currentTrack.artwork} alt="Album art" className="w-16 h-16 rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Music size={32} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{currentTrack.title}</h4>
                          <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
                          <p className="text-gray-500 text-xs">{currentTrack.album}</p>
                        </div>
                        <button
                          onClick={togglePlayPause}
                          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {tracks.length > 0 ? (
                      tracks.map(track => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className={`rounded-lg p-3 cursor-pointer transition-colors ${
                            currentTrack?.id === track.id
                              ? 'bg-blue-900/50 border border-blue-700'
                              : 'bg-gray-800 hover:bg-gray-750'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {track.artwork ? (
                              <img src={track.artwork} alt="Album art" className="w-10 h-10 rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                                <Music size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{track.title}</p>
                              <p className="text-gray-400 text-xs">{track.artist} • {track.album}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        <Music size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No tracks uploaded</p>
                        <p className="text-sm mt-2">Click Upload to add music</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area (only for Chat tab) */}
            {activeTab === 'chat' && (
              <div className="border-t border-gray-700 p-4">
                {commandMode && (
                  <div className="flex items-center space-x-2 mb-2 text-xs text-blue-400">
                    <Command size={14} />
                    <span>Command Mode</span>
                  </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={commandMode ? "Enter command..." : "Type a message..."}
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </>
  );
};

export default JarvisOverlay;
