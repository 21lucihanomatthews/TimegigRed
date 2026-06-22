import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, ArrowLeft, Share2, Edit2, Trash2 } from 'lucide-react';
import { Seeker } from '../types';
import { useData } from '../DataContext';
import { useUser } from '../UserContext';
import SeekerForm from './SeekerForm';
import SeekerCard from './SeekerCard';
import ProvinceFilter from './ProvinceFilter';
import SafeImage from './SafeImage';

interface Props {
  onToggleForm?: (isShowing: boolean) => void;
  onToggleView?: (isShowing: boolean) => void;
  onChatRequest: (contactId: string, initialMessage?: string) => void;
}

export default function SeekersPage({ onToggleForm, onToggleView, onChatRequest }: Props) {
  const { profile } = useUser();
  const { seekers, addSeeker, updateSeeker, deleteSeeker } = useData();
  const [showForm, setShowForm] = useState(false);
  const [congratulate, setCongratulate] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null);
  const [editingSeeker, setEditingSeeker] = useState<Seeker | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');

  const filteredSeekers = seekers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = selectedProvince === 'All Provinces' || s.location.toLowerCase().includes(selectedProvince.toLowerCase());

    return matchesSearch && matchesProvince;
  });

  const toggleForm = (show: boolean) => {
    setShowForm(show);
    onToggleForm?.(show);
    if (!show) setEditingSeeker(null);
  };

  const handlePost = (seeker: Seeker) => {
    if (editingSeeker) {
      updateSeeker(seeker);
      setEditingSeeker(null);
    } else {
      addSeeker(seeker);
      setCongratulate(true);
      setTimeout(() => setCongratulate(false), 3000);
    }
    toggleForm(false);
  };

  const handleShare = async (seeker: Seeker) => {
    const shareText = `Check out this seeker profile: ${seeker.name} - ${seeker.rate}. ${seeker.description}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: seeker.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleDelete = (id: string) => {
    deleteSeeker(id);
    setSelectedSeeker(null);
    onToggleView?.(false);
    setDeletedMsg(true);
    setTimeout(() => setDeletedMsg(false), 2000);
  };

  const handleView = (seeker: Seeker) => {
    setSelectedSeeker(seeker);
    setCurrentImageIndex(0);
    onToggleView?.(true);
  };

  const handleEdit = (seeker: Seeker) => {
    setEditingSeeker(seeker);
    toggleForm(true);
    setSelectedSeeker(null);
  };

  const handleHire = (seeker: Seeker) => {
    if (seeker.ownerId === profile.id) return;
    onChatRequest(seeker.ownerId, `Hi ${seeker.name}, I'm interested in hiring you!`);
  };

  return (
    <div className="space-y-4">
      {congratulate && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold">
          Congratulations! Your seeker profile is now live!
        </div>
      )}
      {deletedMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-bold">
          Profile deleted successfully.
        </div>
      )}
      
      {selectedSeeker && (
        <div className="fixed inset-0 bg-white z-[60] overflow-y-auto flex flex-col">
          <div className="flex items-center px-4 h-16 border-b shrink-0 bg-white sticky top-0 z-10">
            <button onClick={() => { setSelectedSeeker(null); onToggleView?.(false); }} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-black">
               <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter uppercase flex-1 truncate">{selectedSeeker.name}</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => handleShare(selectedSeeker)} 
                className="p-2 text-green-600 border border-green-200 rounded-full hover:bg-green-50 transition-colors"
                title="Share to WhatsApp"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {selectedSeeker.ownerId === profile.id && (
                <>
                  <button onClick={() => handleEdit(selectedSeeker)} className="p-2 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => { if(confirm('Delete profile?')) handleDelete(selectedSeeker.id); }} className="p-2 text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <motion.div
              className="relative w-full h-64 overflow-hidden rounded-2xl shadow-xl cursor-grab"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_e, { offset }) => {
                if (offset.x < -50) setCurrentImageIndex(prev => Math.min(prev + 1, selectedSeeker.images.length - 1));
                if (offset.x > 50) setCurrentImageIndex(prev => Math.max(prev - 1, 0));
              }}
            >
              <AnimatePresence mode="wait">
                <SafeImage
                  key={currentImageIndex}
                  className="w-full h-full object-cover"
                  src={selectedSeeker.images[currentImageIndex]} 
                  alt={`${selectedSeeker.name} - Image ${currentImageIndex + 1}`}
                  as={motion.img}
                  {...{
                    initial: { opacity: 0, x: 100 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -100 }
                  } as any}
                />
              </AnimatePresence>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-black bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                {currentImageIndex + 1} / {selectedSeeker.images.length}
              </div>
            </motion.div>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase mt-6">{selectedSeeker.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-100">Seeker</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In {selectedSeeker.location}</span>
            </div>
            
            <p className="text-zinc-600 mt-4 leading-relaxed">{selectedSeeker.description}</p>
            <p className="mt-6 text-2xl font-black text-blue-600 italic tracking-tighter uppercase">Rate: {selectedSeeker.rate}</p>
            
            <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact Details</label>
                <p className="text-sm font-bold text-zinc-800">{selectedSeeker.contactInfo}</p>
              </div>
              
              {selectedSeeker.socialMedia?.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Social Presence</label>
                  <p className="text-sm font-medium text-blue-600 break-all">{selectedSeeker.socialMedia.join(', ')}</p>
                </div>
              )}
            </div>

            {selectedSeeker.ownerId !== profile.id ? (
              <button 
                onClick={() => {
                  setSelectedSeeker(null);
                  onToggleView?.(false);
                  onChatRequest(selectedSeeker.ownerId, `Hi ${selectedSeeker.name}, I'm interested in hiring you!`);
                }} 
                className="w-full mt-8 h-14 bg-zinc-900 text-white rounded-2xl font-black italic tracking-wider hover:bg-black transition-all shadow-xl active:scale-95"
              >
                HiRE THiS SEEKER
              </button>
            ) : (
              <div className="mt-8 p-4 bg-zinc-50 text-zinc-500 rounded-2xl text-center font-bold border border-zinc-100 uppercase tracking-widest text-xs">
                This is your profile
              </div>
            )}
          </div>
        </div>
      )}

      {!showForm ? (
        <>
          <div className="flex gap-2 items-center">
             <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search seekers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={() => toggleForm(true)} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2">
              <UserPlus size={16} />
              Create Seeker Profile
            </button>
          </div>

          <ProvinceFilter selectedProvince={selectedProvince} onSelect={setSelectedProvince} />

          <div className="grid grid-cols-2 gap-4">
            {filteredSeekers.map((s) => (
              <SeekerCard key={s.id} seeker={s} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onHire={handleHire} />
            ))}
          </div>
        </>
      ) : (
        <SeekerForm onPost={handlePost} onCancel={() => toggleForm(false)} initialData={editingSeeker || undefined} />
      )}
    </div>
  );
}
