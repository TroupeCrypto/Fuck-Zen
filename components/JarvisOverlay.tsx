'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  MessageSquare,
  Target,
  Bell,
  Music,
  Send,
  Command,
  Play,
  Pause,
  Upload,
} from 'lucide-react';
import { Executive, ConnectionStatus } from '../types';

const DB_NAME = 'JarvisDB';
const DB_VERSION = 1;
const STORE_TRACKS = 'tracks';
const STORE_PLAYLISTS = 'playlists';
const STORAGE_KEY_NOTIFICATIONS = 'jarvis-notifications';

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

interface StoredNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  file?: File; // ephemeral (never stored in IDB)
  url?: string; // blob URL (ephemeral) OR data URL (persisted)
}

interface StoredTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  fileData?: string; // DataURL
}

interface JarvisOverlayProps {
  executives?: Executive[];
}

type TabType = 'chat' | 'scopes' | 'notifications' | 'music';

function safeUUID() {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

function openJarvisDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
      }
    };

    req.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

function idbPut(db: IDBDatabase, storeName: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('IndexedDB put failed'));
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });
}

function idbGetAll<T = any>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []) as T[]);
    req.onerror = () => reject(req.error || new Error('IndexedDB getAll failed'));
  });
}

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
  const dbRef = useRef<IDBDatabase | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Init DB + load tracks + load notifications
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Notifications (localStorage) first
      try {
        loadNotifications();
      } catch (e) {
        console.error(e);
      }

      // IndexedDB for tracks
      try {
        const db = await openJarvisDB();
        if (cancelled) return;
        dbRef.current = db;
        await loadTracksFromDB();
      } catch (e) {
        console.error('IndexedDB init/load failed:', e);
      }
    })();

    return () => {
      cancelled = true;
      // close DB handle
      try {
        dbRef.current?.close();
      } catch {}
      dbRef.current = null;
      // revoke blob URLs
      try {
        setTracks((prev) => {
          prev.forEach((t) => {
            if (t.url && t.url.startsWith('blob:')) URL.revokeObjectURL(t.url);
          });
          return prev;
        });
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Command mode detection
  useEffect(() => {
    setCommandMode(input.startsWith('/'));
  }, [input]);

  const getDefaultNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'System Update',
      message: 'Jarvis overlay initialized successfully',
      timestamp: new Date(),
      read: false,
    },
  ];

  const loadNotifications = () => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      setNotifications(getDefaultNotifications());
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredNotification[];
      const hydrated: Notification[] = (parsed || []).map((n) => {
        const ts = new Date(n.timestamp);
        if (isNaN(ts.getTime())) throw new Error('Invalid timestamp in stored notifications');
        return { ...n, timestamp: ts };
      });
      setNotifications(hydrated.length ? hydrated : getDefaultNotifications());
    } catch (err) {
      console.error('Failed to load notifications from localStorage:', err);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      setNotifications(getDefaultNotifications());
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    if (typeof window === 'undefined') return;
    const toStore: StoredNotification[] = notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp.toISOString(),
      read: n.read,
    }));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(toStore));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const saveTrackToDB = async (track: Track) => {
    if (typeof window === 'undefined') return;
    if (!dbRef.current) {
      dbRef.current = await openJarvisDB();
    }

    const db = dbRef.current!;
    const stored: StoredTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: track.artwork,
      fileData: track.url && track.url.startsWith('data:') ? track.url : undefined,
    };

    await idbPut(db, STORE_TRACKS, stored);
  };

  const loadTracksFromDB = async () => {
    if (typeof window === 'undefined') return;
    if (!dbRef.current) return;

    const db = dbRef.current;
    const stored = await idbGetAll<StoredTrack>(db, STORE_TRACKS);

    const hydrated: Track[] = (stored || []).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      artwork: t.artwork,
      url: t.fileData, // persisted DataURL
    }));

    setTracks(hydrated);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const newMessage: JarvisMessage = {
      id: safeUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    setIsTyping(true);
    window.setTimeout(() => {
      const response: JarvisMessage = {
        id: safeUUID(),
        text: commandMode
          ? `Command executed: ${text}`
          : `Processing your request: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        sender: 'jarvis',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 650);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) continue;

      const id = safeUUID();
      const title = file.name.replace(/\.[^/.]+$/, '') || 'Untitled Track';

      // Persisted URL should be DataURL (so it survives refresh). Blob URLs are not persistent.
      let dataUrl = '';
      try {
        dataUrl = await toDataURL(file);
      } catch (err) {
        console.error('Failed to read audio file:', err);
        continue;
      }

      const track: Track = {
        id,
        title,
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        url: dataUrl,
      };

      try {
        await saveTrackToDB(track);
      } catch (err) {
        console.error('Failed to save track to IndexedDB:', err);
      }

      setTracks((prev) => [...prev, track]);
    }

    // allow re-uploading same file selection
    e.target.value = '';
  };

  const playTrack = (track: Track) => {
    if (!audioRef.current) return;
    if (!track.url) return;

    setCurrentTrack(track);
    audioRef.current.src = track.url;

    const p = audioRef.current.play();
    if (p && typeof (p as any).catch === 'function') {
      (p as any).catch((err: any) => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
    }
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const p = audioRef.current.play();
      if (p && typeof (p as any).catch === 'function') {
        (p as any).catch((err: any) => {
          console.error('Audio play failed:', err);
          setIsPlaying(false);
        });
      }
      setIsPlaying(true);
    }
  };

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
    if (touchStart == null || touchEnd == null) return;

    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isDownSwipe) {
      setIsOpen(false);
      setIsMinimized(true);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleCloseOverlay = () => {
    setIsOpen(false);
    setIsMinimized(true);
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
            if (e.target === e.currentTarget) handleCloseOverlay();
          }}
        >
          <div
            className="bg-gray-900 w-full md:w-[600px] md:max-h-[700px] h-[80vh] md:h-auto rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col border border-gray-700"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jarvis-header"
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
                  <h2 id="jarvis-header" className="text-white font-semibold">
                    Jarvis
                  </h2>
                  <p className="text-gray-400 text-xs">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCloseOverlay}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  aria-label="Minimize"
                >
                  <span className="text-xl">−</span>
                </button>
                <button
                  onClick={handleCloseOverlay}
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
            <div role="tablist" className="flex border-b border-gray-700">
              <button
                id="chat-tab"
                role="tab"
                aria-selected={activeTab === 'chat'}
                aria-controls="chat-panel"
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
                id="scopes-tab"
                role="tab"
                aria-selected={activeTab === 'scopes'}
                aria-controls="scopes-panel"
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
                id="notifications-tab"
                role="tab"
                aria-selected={activeTab === 'notifications'}
                aria-controls="notifications-panel"
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
                id="music-tab"
                role="tab"
                aria-selected={activeTab === 'music'}
                aria-controls="music-panel"
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
                <div
                  role="tabpanel"
                  id="chat-panel"
                  aria-labelledby="chat-tab"
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.map((msg) => (
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
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-200 rounded-2xl px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]"></div>
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
                <div role="tabpanel" id="scopes-panel" aria-labelledby="scopes-tab" className="space-y-3">
                  <h3 className="text-white font-semibold mb-3">System Scopes</h3>
                  {executives.length > 0 ? (
                    executives.map((exec) => (
                      <div key={exec.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{exec.name}</p>
                            <p className="text-gray-400 text-sm">{exec.role}</p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              exec.status === ConnectionStatus.ACTIVE ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                          ></div>
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
                <div
                  role="tabpanel"
                  id="notifications-panel"
                  aria-labelledby="notifications-tab"
                  className="space-y-3"
                >
                  <h3 className="text-white font-semibold mb-3">Notifications</h3>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
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
                            <p className="text-gray-500 text-xs mt-2">{notif.timestamp.toLocaleString()}</p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
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
                <div role="tabpanel" id="music-panel" aria-labelledby="music-tab" className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Music Library</h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                      type="button"
                    >
                      <Upload size={16} />
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
                          // eslint-disable-next-line @next/next/no-img-element
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
                          type="button"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {tracks.length > 0 ? (
                      tracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className={`rounded-lg p-3 cursor-pointer transition-colors ${
                            currentTrack?.id === track.id
                              ? 'bg-blue-900/50 border border-blue-700'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') playTrack(track);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {track.artwork ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={track.artwork} alt="Album art" className="w-10 h-10 rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                                <Music size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{track.title}</p>
                              <p className="text-gray-400 text-xs">
                                {track.artist} • {track.album}
                              </p>
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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={commandMode ? 'Enter command...' : 'Type a message...'}
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                    aria-label="Send"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </>
  );
};

export default JarvisOverlay;
