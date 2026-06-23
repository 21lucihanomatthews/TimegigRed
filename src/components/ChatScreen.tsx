import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Image, Video, Smile, Trash2, Edit2, Ban, ArrowLeft, X, Check, Camera, MoreVertical, Flag, Mic, Play, Pause, Phone, PhoneOff, UserPlus, Sparkles, Volume2, ShieldCheck, MicOff, Pin, VideoOff, Users, MessageSquare, ScreenShare } from 'lucide-react';
import { motion } from 'motion/react';
import { Message, Contact } from '../types';
import { useUser } from '../UserContext';
import SafeImage from './SafeImage';

const EMOJIS = ['😀', '😂', '😍', '🤔', '👍', '🔥', '🚀', '✨', '🎉', '❤️', '🙌', '😎', '💡', '✅', '❌', '💰'];

const AVAILABLE_PARTICIPANTS = [
  { id: 'p1', name: 'Zama Myeni', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', role: 'Business Consultant' },
  { id: 'p2', name: 'Sipho Ndlovu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', role: 'Construction Contractor' },
  { id: 'p3', name: 'Chantel Pretorius', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', role: 'Event Manager & Planner' },
  { id: 'p4', name: 'Thabo Mokoena', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', role: 'Software Developer' },
  { id: 'p5', name: 'Lerato Molefe', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop', role: 'Digital Marketer' },
  { id: 'p6', name: 'Susan van der Merwe', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', role: 'Accounting Specialist' },
];

const MOCK_SOUND_URL = "https://www.w3schools.com/html/horse.mp3";

function VoiceMessagePlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (url) {
      const playbackUrl = url === "MOCK_AUDIO_URL" ? MOCK_SOUND_URL : url;
      const audio = new Audio(playbackUrl);
      audioRef.current = audio;
      
      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
      };
      
      const onTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('timeupdate', onTimeUpdate);
      
      return () => {
        audio.pause();
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audioRef.current = null;
      };
    }
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.ended) audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.error("Playback failed:", err);
          setIsPlaying(true);
          let interval = setInterval(() => {
            setProgress(p => {
              if (p >= 100) {
                clearInterval(interval);
                setIsPlaying(false);
                return 0;
              }
              return p + 2;
            });
          }, 100);
        });
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-emerald-50/50 p-2.5 rounded-2xl min-w-[200px] border border-emerald-100/50 shadow-sm backdrop-blur-md">
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 group shrink-0"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="translate-x-[1px] fill-current" />}
      </button>
      <div className="flex-grow flex flex-col gap-1">
        <div className="flex justify-between items-center">
            <div className="flex gap-[2px] items-center h-6">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[2px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-200'}`}
                  style={{ 
                    height: `${Math.max(4, Math.sin((i * 1.5 + progress/2)) * 8 + 10)}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          <span className="text-[10px] text-emerald-600 font-black italic tracking-tighter uppercase">0:0{Math.floor(progress / 20)}</span>
        </div>
        <div className="w-full bg-emerald-100/50 h-1 rounded-full overflow-hidden relative">
          <motion.div 
            className="bg-emerald-600 h-full rounded-full" 
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}


import ConnectionRope from './ConnectionRope';

interface Props {
  contact: Contact;
  onBack: () => void;
  initialMessage?: string | null;
  onInitialMessageSent?: () => void;
}

export default function ChatScreen({ contact, onBack, initialMessage, onInitialMessageSent }: Props) {
  const { profile, messages: allMessages, sendMessage, updateMessage, deleteMessage: globalDeleteMessage } = useUser();

  const conversationMessages = useMemo(() => {
    return allMessages.filter(
      m => (m.fromId === profile.id && m.toId === contact.id) ||
           (m.fromId === contact.id && m.toId === profile.id)
    );
  }, [allMessages, profile.id, contact.id]);

  const activeMessagesCount = useMemo(() => {
    return conversationMessages.filter(m => !m.isDeleted).length;
  }, [conversationMessages]);

  const connectionProgress = useMemo(() => {
    // 0 messages = 10%, 15 messages = 100%
    return Math.min(1, 0.1 + (activeMessagesCount / 15) * 0.9);
  }, [activeMessagesCount]);

  useEffect(() => {
    if (initialMessage && onInitialMessageSent) {
      sendMessage({
        fromId: profile.id,
        toId: contact.id,
        text: initialMessage,
        status: 'sent',
        isRead: false
      });
      onInitialMessageSent();
    }
  }, [initialMessage, onInitialMessageSent, profile.id, contact.id, sendMessage]);

  useEffect(() => {
    // Mark as read
    conversationMessages.forEach(m => {
      if (m.fromId === contact.id && !m.isRead) {
        updateMessage(m.id, { isRead: true, status: 'read' });
      }
    });
  }, [conversationMessages, contact.id, updateMessage]);

  // Voicenote states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Video call states
  const [isInCall, setIsInCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState<any[]>([]);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isInCall) {
      setCallParticipants([
        { id: profile.id, name: `${profile.name} (You)`, avatar: profile.avatarUrl, isLocal: true, videoOn: !localVideoMuted, audioOn: !localAudioMuted },
        { id: contact.id, name: contact.name, avatar: contact.avatar, isLocal: false, videoOn: true, audioOn: true }
      ]);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera/Mic access failed:", err);
          alert("Microphone and Camera permissions are required to participate in the video conference. Please enable them in your browser settings.");
          setIsInCall(false);
          setLocalAudioMuted(true);
          setLocalVideoMuted(true);
        });
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall]);

  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check permission status on mount
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermissionGranted(result.state === 'granted');
        result.onchange = () => {
          setMicPermissionGranted(result.state === 'granted');
        };
      }).catch(() => {
        // Fallback if query fails
        setMicPermissionGranted(null);
      });
    }
  }, []);

  const startRecording = async () => {
    try {
      // Explicitly request permission if not already granted or if status unknown
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionGranted(true);
      
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
      let supportedType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          supportedType = type;
          break;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : {});
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(200); // Collect data every 200ms
      setIsRecording(true);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access failed:", err);
      alert("Microphone access is required to record voice notes. Please check your browser permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    } else {
      setAudioUrl("MOCK_AUDIO_URL");
    }
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
    setAudioUrl(null);
    setAudioBlob(null);
  };

  const playPreview = () => {
    if (audioUrl) {
      const playbackUrl = audioUrl === "MOCK_AUDIO_URL" ? MOCK_SOUND_URL : audioUrl;
      
      if (!previewAudioRef.current || previewAudioRef.current.src !== playbackUrl) {
        if (previewAudioRef.current) previewAudioRef.current.pause();
        const audio = new Audio(playbackUrl);
        previewAudioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingPreview(false);
          if (previewAudioRef.current) previewAudioRef.current.currentTime = 0;
        };
      }
      
      if (previewAudioRef.current.ended) previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(e => {
        console.warn("Playback failed, using fallback animation", e);
        // Ensure UI shows animation even if audio blocked
        setIsPlayingPreview(true);
        if (audioUrl === "MOCK_AUDIO_URL") {
          setTimeout(() => setIsPlayingPreview(false), 5000);
        }
      });
    }
  };

  const pausePreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsPlayingPreview(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [input, setInput] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [showActionsId, setShowActionsId] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const handleSend = (text?: string, mediaUrls?: string[], mediaType?: 'image' | 'video' | 'voice') => {
    if (!text?.trim() && (!mediaUrls || mediaUrls.length === 0)) return;
    sendMessage({
      fromId: profile.id,
      toId: contact.id,
      text,
      mediaUrls,
      mediaType,
      isRead: false,
      likes: []
    });
    setInput('');
    setShowEmojis(false);
  };
  
  const deleteMessage = (id: string) => {
    globalDeleteMessage(id);
  };
  
  const editMessage = (id: string, newText: string) => {
      updateMessage(id, { text: newText, isEdited: true });
      setEditingId(null);
  }

  const initiateLongPress = (id: string) => {
      pressTimerRef.current = setTimeout(() => {
          setLikingId(id);
      }, 500);
  };

  const cancelLongPress = () => {
      if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
          pressTimerRef.current = null;
      }
  };

  const handleTap = (id: string) => {
      const now = Date.now();
      if (now - (lastTapRef.current[id] || 0) < 300) {
          const m = conversationMessages.find(msg => msg.id === id);
          if (m) {
              const newLikes = (m.likes && m.likes.length > 0) ? [] : ['❤️'];
              updateMessage(id, { likes: newLikes });
          }
          lastTapRef.current[id] = 0;
          setShowActionsId(null);
      } else {
          lastTapRef.current[id] = now;
          setShowActionsId(showActionsId === id ? null : id);
      }
  };

  const likeMessage = (id: string, emoji: string) => {
      updateMessage(id, { likes: [emoji] });
      setLikingId(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      
      const newUrls = files.map(file => URL.createObjectURL(file as unknown as Blob));
      handleSend('', newUrls, type);
  };

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Ban size={48} className="text-gray-400"/>
        <p className="mt-4 text-lg text-gray-600">You have blocked this user.</p>
        <button onClick={() => setIsBlocked(false)} className="mt-4 p-2 bg-gray-200 rounded">Unblock</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-transparent">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-md text-white p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-white/10">
        <button onClick={onBack}><ArrowLeft size={24} /></button>
        <SafeImage src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full bg-white"/>
        <button onClick={() => setShowProfile(true)} className="flex-grow text-left font-semibold">{contact.name}</button>
        
        {/* Live Video Conference Initiator */}
        <button 
          onClick={() => setIsInCall(true)} 
          className="p-2 hover:bg-gray-700/80 rounded-full text-blue-400 hover:text-blue-300 transition flex items-center justify-center"
          title="Start Live Video Call"
        >
          <Video size={20} />
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20}/></button>
          {showMenu && (
            <div className="absolute top-full right-0 bg-white text-black p-2 rounded shadow-lg z-50 animate-fadeIn">
              <button onClick={() => { setIsBlocked(!isBlocked); setShowMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">{isBlocked ? 'Unblock User' : 'Block User'}</button>
              <button onClick={() => { setIsReported(true); setShowMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 italic text-red-500">Report User</button>
            </div>
          )}
        </div>
      </div>

        {/* Profile Info Overlay */}
        {showProfile && (
            <div className="absolute inset-0 bg-white z-50 p-6 flex flex-col items-center">
                <button className="self-end" onClick={() => setShowProfile(false)}><X/></button>
                <SafeImage src={contact.avatar} alt={contact.name} className="w-32 h-32 rounded-full border-4 border-gray-200 mt-10 shadow-lg"/>
                <h2 className="text-2xl font-bold mt-4">{contact.name}</h2>
                {isReported && <p className="text-red-500 mt-2 font-bold">User Reported</p>}
                <p className="text-gray-600 mt-2">Expert UI Designer with 10 years experience.</p>
                <p className="text-gray-500 mt-1">Available for work: Yes</p>
            </div>
        )}

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white/10 backdrop-blur-[1px]">
        <ConnectionRope 
          ownerAvatar={profile.avatarUrl} 
          seekerAvatar={contact.avatar} 
          progress={connectionProgress} 
        />
        {conversationMessages.map((msg) => {
          const isFromMe = msg.fromId === profile.id;
          const showActions = showActionsId === msg.id;
          const isVoice = msg.mediaType === 'voice';
          return (
          <div key={msg.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`relative max-w-[85%] p-2.5 rounded-2xl text-sm transition-all group shadow-xl backdrop-blur-md ${
                isFromMe ? (msg.isDeleted ? 'bg-zinc-100/30' : 'bg-white text-zinc-900') : 'bg-white/80 text-zinc-800'
              } ${
                !msg.status || msg.status === 'unread' ? 'border-2 border-rose-500/60' : 
                (msg.status === 'read' || msg.status === 'success' || msg.status === 'opened') ? 'border-2 border-emerald-500/60' : 
                msg.status === 'ignored' ? 'border-2 border-zinc-900' : 'border border-zinc-200'
              }`} 
              onTouchStart={() => initiateLongPress(msg.id)} 
              onTouchEnd={cancelLongPress} 
              onTouchCancel={cancelLongPress} 
              onClick={() => handleTap(msg.id)}
            >
              {msg.isDeleted ? <p className="italic text-zinc-400 whitespace-pre-wrap">{msg.text}</p> : (
                  <>
                      {msg.text && <p className={`whitespace-pre-wrap ${isFromMe ? 'text-zinc-900' : 'text-zinc-800'}`}>{msg.text}</p>}
                      {msg.mediaUrls && (
                          <div className="flex flex-wrap gap-2 mt-2">
                              {msg.mediaUrls.map(url => (
                                  msg.mediaType === 'voice' ? (
                                      <VoiceMessagePlayer key={url} url={url} />
                                  ) : msg.mediaType === 'image' ? (
                                      <SafeImage key={url} src={url} className="rounded w-32 h-32 object-cover border border-white/20" />
                                  ) : (
                                      <video key={url} src={url} controls className="rounded w-48 border border-white/20" />
                                  )
                              ))}
                          </div>
                      )}
                      {msg.likes && msg.likes.length > 0 && (
                          <div className="mt-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs inline-block shadow-sm border border-white/20">
                             {msg.likes.map((emoji, idx) => (
                               <motion.div
                                 key={`${msg.id}-${idx}-${emoji}`}
                                 animate={{ y: [0, -15, 0], rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                                 transition={{ repeat: Infinity, duration: 0.8, delay: idx * 0.2 }}
                                 className="inline-block"
                               >
                                 {emoji}
                               </motion.div>
                             ))}
                          </div>
                      )}
                      <span className={`text-[9px] block text-right mt-1 ${isFromMe ? 'text-zinc-400' : 'text-zinc-500'}`}>{msg.timestamp} {msg.isEdited && '(edited)'}</span>
                  </>
              )}
              <div className={`absolute bottom-full right-0 mb-1 flex gap-1 transition-all ${showActions ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}>
                  {isFromMe && !msg.isDeleted && (
                      <>
                        {isVoice && (
                          <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} className="w-8 h-8 bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-rose-500/20"><Trash2 size={14} className="text-rose-400"/></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(msg.id); }} className="w-8 h-8 bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-blue-500/20"><Edit2 size={14} className="text-blue-400"/></button>
                      </>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setLikingId(msg.id); }} className="w-8 h-8 bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-amber-500/20"><Smile size={14} className="text-amber-400"/></button>
              </div>

              {likingId === msg.id && (
                  <>
                    <div className="fixed inset-0 z-5 bg-transparent" onClick={() => setLikingId(null)}></div>
                    <div className="absolute bg-white p-2 shadow-lg border rounded-xl grid grid-cols-8 gap-1 z-10 w-64 mt-1 right-0">
                        {EMOJIS.map((emoji, index) => (
                          <button 
                            key={index} 
                            onClick={() => likeMessage(msg.id, emoji)} 
                            className="hover:scale-125 transition-transform"
                          >{emoji}</button>
                        ))}
                    </div>
                  </>
              )}
              {editingId === msg.id && (
                  <div className="mt-2 flex gap-2">
                      <input type="text" defaultValue={msg.text} className="p-1 rounded text-black text-xs border border-gray-200 outline-none" onBlur={(e) => editMessage(msg.id, e.target.value)}/>
                      <button onClick={() => setEditingId(null)}><Check size={16}/></button>
                  </div>
              )}
            </div>
          </div>
        );})}
        <div ref={messagesEndRef} />
      </div>

             {/* Input */}
      <div className="p-4 bg-white/10 backdrop-blur-xl border-t border-white/10 relative z-10">
        {isRecording ? (
          /* Live Recording Screen controls */
          <div className="flex items-center justify-between bg-rose-500/10 text-rose-900 border border-rose-500/20 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
              <div className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-red-700">
                <Mic size={14} className="text-red-700" />
                <span>Recording Live:</span>
                <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-800">{formatTime(recordingTime)}</span>
              </div>
            </div>
            
            {/* Animated Wave visualizer */}
            <div className="flex items-center gap-0.5 h-6">
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [8, Math.floor(Math.random() * 20 + 8), 8] }}
                  transition={{ repeat: Infinity, duration: 0.4 + i * 0.1, ease: 'easeInOut' }}
                  className="w-1 bg-red-500 rounded-full"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              <button 
                onClick={cancelRecording} 
                className="p-2 hover:bg-red-100 rounded-full transition text-gray-500 hover:text-red-600"
                title="Cancel Recording"
              >
                <X size={20} />
              </button>
              {/* Stop Button */}
              <button 
                onClick={stopRecording} 
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md flex items-center justify-center animate-bounce"
                title="Stop and Preview"
              >
                <div className="w-2.5 h-2.5 bg-white rounded-sm" />
              </button>
            </div>
          </div>
        ) : audioUrl ? (
          /* Playback Preview state controls */
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 flex-grow">
              <button 
                onClick={isPlayingPreview ? pausePreview : playPreview}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition shadow-md shrink-0"
              >
                {isPlayingPreview ? <Pause size={18} /> : <Play size={18} className="translate-x-[0.5px]" />}
              </button>
              <div className="flex-grow">
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block mb-0.5 text-left">Recording Preview</span>
                <div className="flex items-center gap-2">
                  {/* Dynamic waveform timeline display */}
                  <div className="flex-grow bg-blue-200 h-1.5 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="bg-blue-600 h-full rounded-full"
                      animate={isPlayingPreview ? { width: ['0%', '100%'] } : {}}
                      transition={isPlayingPreview ? { duration: audioUrl === "MOCK_AUDIO_URL" ? 3 : (previewAudioRef.current?.duration || 5), ease: "linear" } : {}}
                    />
                  </div>
                  <span className="text-xs font-mono text-blue-800">RSA-VOX</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
              {/* Delete / Recut voicenote */}
              <button 
                onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
                className="p-2 hover:bg-blue-100 text-gray-500 hover:text-red-500 rounded-full transition"
                title="Discard Voicenote"
              >
                <Trash2 size={20} />
              </button>
              {/* Approve & Broadcast as message */}
              <button 
                onClick={() => {
                  handleSend('', [audioUrl], 'voice');
                  setAudioUrl(null);
                  setAudioBlob(null);
                }}
                className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full transition shadow-md flex items-center justify-center"
                title="Send Voicenote"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Input bar with Mic addition button */
          <div className="flex items-center gap-1 md:gap-3 bg-white/70 backdrop-blur-md p-1.5 md:p-2 rounded-2xl shadow-xl border border-white/40 focus-within:ring-2 focus-within:ring-blue-400/30 relative">
            <button className="flex-shrink-0 text-gray-500 hover:text-gray-700 p-1" onClick={() => setShowEmojis(!showEmojis)}><Smile size={20}/></button>
            
            {showEmojis && (
                <div className="absolute bottom-full mb-2 left-0 bg-white p-4 border border-gray-200 rounded-2xl shadow-xl grid grid-cols-8 gap-2 w-64 md:w-72 h-64 overflow-y-auto z-50">
                    {EMOJIS.map((emoji, index) => (
                      <button 
                        key={index} 
                        onClick={() => setInput(input + emoji)} 
                        className="hover:scale-125 transition-transform text-lg flex items-center justify-center p-1"
                      >{emoji}</button>
                    ))}
                </div>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow min-w-0 p-1 text-sm outline-none bg-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            />
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, e.target.accept.includes('image') ? 'image' : 'video')} accept="image/*"/>
            <button className="flex-shrink-0 text-gray-500 hover:text-gray-700 p-1" onClick={() => {fileInputRef.current!.accept = 'image/*'; fileInputRef.current?.click()}}><Image size={20}/></button>
            <button className="flex-shrink-0 text-gray-500 hover:text-gray-700 p-1 hidden sm:block" onClick={() => {fileInputRef.current!.accept = 'video/*'; fileInputRef.current?.click()}}><Video size={20}/></button>
            
            {/* Live Vocals Voice Record button */}
            <div className="relative group flex-shrink-0">
              <button 
                onClick={startRecording}
                className={`${micPermissionGranted === false ? 'text-red-400 bg-red-50' : 'text-gray-500'} hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition duration-150 flex items-center justify-center`}
                title={micPermissionGranted === false ? "Microphone access blocked. Click to retry." : "Record live voice note"}
              >
                <Mic size={20} />
                {micPermissionGranted === false && (
                   <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
              {micPermissionGranted === null && (
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl">
                  Connect your microphone to send real-time voice notes.
                </div>
              )}
            </div>

            <button onClick={() => handleSend(input)} className="flex-shrink-0 p-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Video Call Interface */}
      {isInCall && (
        <div className="absolute inset-0 bg-black text-white z-[120] flex flex-col overflow-hidden animate-fadeIn font-sans">
          {/* Zoom-style Header (Floating) */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-[130] pointer-events-none">
            <div className="bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 pointer-events-auto flex items-center gap-2 shadow-2xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-200 tracking-tight">Zoom Meeting: TimeGiG Collaboration</span>
            </div>
            
            <div className="bg-zinc-900/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 pointer-events-auto flex items-center gap-2 shadow-2xl">
              <ShieldCheck size={14} className="text-emerald-400 stroke-[3]" />
              <span className="text-[10px] text-gray-200 font-black uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
          </div>

          {/* Dynamic Participant Grid Area */}
          <div className={`p-4 md:p-12 lg:p-24 flex-grow flex items-center justify-center transition-all duration-700 ${pinnedParticipantId ? 'bg-zinc-950' : 'bg-black'}`}>
            <div className={`grid gap-4 w-full max-w-5xl mx-auto transition-all duration-500 justify-center content-center ${
              callParticipants.length === 1 ? 'grid-cols-1 max-w-lg' :
              callParticipants.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl' :
              callParticipants.length <= 4 ? 'grid-cols-2 max-w-4xl' :
              'grid-cols-2 md:grid-cols-3 max-w-5xl'
            }`}>
              {callParticipants.map((p) => {
                const isPinned = pinnedParticipantId === p.id;
                return (
                  <motion.div 
                    layout
                    key={p.id} 
                    className={`relative overflow-hidden rounded-2xl flex flex-col justify-center items-center group transition-all duration-300 border-2 aspect-video w-full ${
                      isPinned ? 'border-blue-500 ring-4 ring-blue-500/20 z-10' : 'border-transparent bg-zinc-900/40'
                    } shadow-2xl`}
                  >
                    {/* Participant Info Tag */}
                    <div className="absolute bottom-4 left-4 z-20 bg-zinc-900/90 backdrop-blur-2xl px-3 py-1.5 rounded-lg text-[11px] font-black border border-white/10 flex items-center gap-2 shadow-xl">
                      {!p.audioOn && <MicOff size={12} className="text-rose-500" />}
                      <span className="text-white tracking-tight">{p.name}{p.isLocal ? " (Me)" : ""}</span>
                    </div>

                    {/* Participant Specific Controls */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => setPinnedParticipantId(isPinned ? null : p.id)}
                        className={`p-2 rounded-full transition-all transform active:scale-90 ${isPinned ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-zinc-900/80 text-white hover:bg-zinc-800'}`}
                        title={isPinned ? "Unpin video" : "Pin video to primary view"}
                      >
                        <Pin size={16} className={isPinned ? "fill-white" : ""} />
                      </button>
                      {!p.isLocal && (
                        <button 
                          onClick={() => setCallParticipants(prev => prev.filter(x => x.id !== p.id))}
                          className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full transition-all transform active:scale-90 shadow-lg"
                          title="Disconnect participant"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Stream Content Area */}
                    <div className="w-full h-full flex items-center justify-center relative bg-zinc-950 overflow-hidden">
                      {p.isLocal ? (
                        p.videoOn ? (
                          <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover scale-x-[-1] transition-opacity duration-1000"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-900/80">
                             <div className="relative">
                               <SafeImage src={p.avatar} alt={p.name} className="w-16 h-16 md:w-24 rounded-full border-2 border-zinc-700/50 p-1 mb-2 bg-zinc-800 shadow-2xl" />
                               <div className="absolute top-0 right-0 bg-zinc-900 p-1 rounded-full border border-zinc-700 shadow-lg translate-x-1/4 -translate-y-1/4">
                                 <VideoOff size={10} className="text-rose-500" />
                               </div>
                             </div>
                             <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Local Feed Off</p>
                          </div>
                        )
                      ) : (
                        p.videoOn ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
                            <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 filter blur-3xl scale-125" style={{ backgroundImage: `url(${p.avatar})` }} />
                            <div className="relative z-10 flex flex-col items-center">
                              <SafeImage src={p.avatar} alt={p.name} className="w-16 h-16 md:w-24 rounded-full border-4 border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.25)] mb-4" />
                              <div className="flex gap-1.5 items-end h-8 px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-md border border-white/5">
                                {[...Array(6)].map((_, idx) => (
                                  <motion.div 
                                    key={idx}
                                    animate={{ height: [4, Math.floor(Math.random() * 20 + 4), 4] }}
                                    transition={{ repeat: Infinity, duration: 0.5 + idx * 0.1 }}
                                    className="w-1.2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-900/80">
                            <SafeImage src={p.avatar} alt={p.name} className="w-14 h-14 md:w-20 rounded-full border-2 border-zinc-800 opacity-50 grayscale" />
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-3">Video Disabled</p>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add Screening Box - Adaptive Invite Slot */}
              {callParticipants.length < 6 && (
                <div className="flex items-center justify-center aspect-video bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-800/50">
                  <button 
                    onClick={() => setShowAddParticipantModal(true)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700/50 flex flex-col items-center justify-center transition-all group active:scale-95 shadow-xl"
                    title="Invite participant"
                  >
                    <UserPlus size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[7px] font-black text-zinc-600 group-hover:text-blue-500 uppercase mt-1 tracking-tighter">Invite</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Zoom-Style Control Bar (Pinned Bottom) */}
          <div className="bg-zinc-900/98 border-t border-white/5 px-6 py-3 flex items-center justify-between z-[140] backdrop-blur-2xl shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
            {/* Primary System Controls */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  setLocalAudioMuted(!localAudioMuted);
                  setCallParticipants(prev => prev.map(x => x.isLocal ? { ...x, audioOn: localAudioMuted } : x));
                }}
                className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all ${localAudioMuted ? 'text-rose-500 bg-rose-500/10' : 'text-gray-300 hover:bg-zinc-800'}`}
              >
                <div className="mb-1">
                  {localAudioMuted ? <MicOff size={22} className="stroke-[2.5]" /> : <Mic size={22} className="stroke-[2.5]" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{localAudioMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button 
                onClick={() => {
                  setLocalVideoMuted(!localVideoMuted);
                  setCallParticipants(prev => prev.map(x => x.isLocal ? { ...x, videoOn: localVideoMuted } : x));
                }}
                className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all ${localVideoMuted ? 'text-rose-500 bg-rose-500/10' : 'text-gray-300 hover:bg-zinc-800'}`}
              >
                <div className="mb-1">
                  {localVideoMuted ? <VideoOff size={22} className="stroke-[2.5]" /> : <Video size={22} className="stroke-[2.5]" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">{localVideoMuted ? "Start Vid" : "Stop Vid"}</span>
              </button>
            </div>

            {/* Application Utility Controls */}
            <div className="hidden md:flex items-center gap-1.5 bg-zinc-800/40 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setShowAddParticipantModal(true)} className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-gray-400 hover:bg-zinc-700 hover:text-white transition-all">
                <Users size={20} />
                <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">Peers</span>
              </button>
              
              <button className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-gray-400 hover:bg-zinc-700 hover:text-white transition-all">
                <MessageSquare size={20} />
                <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">Chat</span>
              </button>

              <button 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`flex flex-col items-center justify-center w-20 h-14 rounded-xl transition-all shadow-sm ${isScreenSharing ? 'text-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/20' : 'text-emerald-500/80 hover:bg-emerald-500/10'}`}
              >
                <ScreenShare size={20} className="stroke-[2.5]" />
                <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">{isScreenSharing ? "Sharing" : "Share"}</span>
              </button>

              <button className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-gray-400 hover:bg-zinc-700 hover:text-white transition-all">
                <Smile size={20} />
                <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">React</span>
              </button>
            </div>

            {/* Termination Sequence */}
            <div>
              <button 
                onClick={() => {
                  setIsInCall(false);
                  setCallParticipants([]);
                }}
                className="bg-rose-600 hover:bg-rose-700 hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] text-white px-7 py-2.5 rounded-xl text-xs font-black transition-all transform active:scale-95 uppercase tracking-[0.1em] shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              >
                End Call
              </button>
            </div>
          </div>

          {/* Zoom-Style Overlay Modals */}
          {showAddParticipantModal && (
            <div className="absolute inset-0 bg-black/70 z-[150] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm p-8 shadow-[0_45px_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] relative overflow-hidden"
              >
                {/* Modal Glow Accent */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5 relative z-10">
                  <div>
                    <h3 className="font-black text-[11px] text-white uppercase tracking-[0.25em]">Invite to Session</h3>
                    <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Secure Network Streams</p>
                  </div>
                  <button 
                    onClick={() => setShowAddParticipantModal(false)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition text-zinc-300 shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto space-y-2.5 pr-2 custom-scrollbar relative z-10">
                  {AVAILABLE_PARTICIPANTS.filter(x => !callParticipants.some(cp => cp.id === x.id)).map((candidate) => (
                    <button 
                      key={candidate.id}
                      onClick={() => {
                        setCallParticipants(prev => [...prev, {
                          id: candidate.id,
                          name: candidate.name,
                          avatar: candidate.avatar,
                          isLocal: false,
                          videoOn: true,
                          audioOn: true
                        }]);
                        setShowAddParticipantModal(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 bg-zinc-800/40 hover:bg-blue-600 group rounded-[1.25rem] border border-white/5 transition-all text-left shadow-md hover:shadow-blue-600/30 ring-1 ring-white/5"
                    >
                      <SafeImage src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-full border-2 border-white/5 shrink-0 group-hover:border-white/40 shadow-xl transition-all" />
                      <div className="flex-grow">
                        <h4 className="font-black text-xs text-white group-hover:text-white tracking-tight">{candidate.name}</h4>
                        <p className="text-[10px] text-zinc-500 group-hover:text-blue-100 font-bold uppercase tracking-tight">{candidate.role}</p>
                      </div>
                      <div className="bg-zinc-900/50 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                        <UserPlus size={18} className="text-zinc-500 group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                  {AVAILABLE_PARTICIPANTS.filter(x => !callParticipants.some(cp => cp.id === x.id)).length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center">
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <Users className="text-zinc-700" size={32} />
                      </div>
                      <p className="text-[10px] text-zinc-600 font-extrabold uppercase tracking-[0.2em]">Max Peers Active</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 relative z-10">
                  <button 
                    onClick={() => setShowAddParticipantModal(false)}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 shadow-xl active:scale-[0.98]"
                  >
                    Back to Call
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
