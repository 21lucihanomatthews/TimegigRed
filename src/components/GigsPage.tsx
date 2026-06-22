import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Edit2, Trash2, BriefcaseBusiness, ArrowLeft, Share2 } from 'lucide-react';
import { Gig } from '../types';
import GigForm from './GigForm';
import GigCard from './GigCard';
import ProvinceFilter from './ProvinceFilter';
import SafeImage from './SafeImage';

import { useData } from '../DataContext';
import { useUser } from '../UserContext';

interface Props {
  onNavigate: (tab: string) => void;
  onChatRequest: (contactId: string, initialMessage?: string) => void;
  onToggleForm?: (show: boolean) => void;
  onToggleView?: (show: boolean) => void;
}

export default function GigsPage({ onNavigate, onChatRequest, onToggleForm, onToggleView }: Props) {
  const { profile } = useUser();
  const { gigs, addGig, updateGig, deleteGig } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [congratulate, setCongratulate] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');

  const filteredGigs = gigs.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = selectedProvince === 'All Provinces' || g.location.toLowerCase().includes(selectedProvince.toLowerCase());
    
    return matchesSearch && matchesProvince;
  });


  const handlePost = (gig: Gig) => {
    if (editingGig) {
      updateGig(gig);
      setEditingGig(null);
    } else {
      addGig(gig);
      setCongratulate(true);
      setTimeout(() => setCongratulate(false), 3000);
    }
    setShowForm(false);
    onToggleForm?.(false);
  };

  const handleApply = (gig: Gig) => {
    if (gig.ownerId === profile.id) return;
    setSelectedGig(null);
    onToggleView?.(false);
    onChatRequest(gig.ownerId, `Hi, I saw your gig "${gig.title}" and I can do it!`);
  };

  const handleEdit = (gig: Gig) => {
    setEditingGig(gig);
    setShowForm(true);
    onToggleForm?.(true);
  };

  const handleDelete = (id: string) => {
    deleteGig(id);
    setSelectedGig(null);
    onToggleView?.(false);
    setDeletedMsg(true);
    setTimeout(() => setDeletedMsg(false), 2000);
  };

  const handleShare = async (gig: Gig) => {
    const shareText = `Check out this gig: ${gig.title} - ${gig.budget}. ${gig.description}`;
    const shareUrl = window.location.href; // In real app, this would be a deep link

    if (navigator.share) {
      try {
        await navigator.share({
          title: gig.title,
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

  const handleView = (gig: Gig) => {
    setSelectedGig(gig);
    setCurrentImageIndex(0);
    onToggleView?.(true);
  };

  return (
    <div className="space-y-4">
      {congratulate && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold">
          Congratulations! Your gig is now live!
        </div>
      )}
      {deletedMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-bold">
          Gig deleted successfully.
        </div>
      )}
      
      {selectedGig && (
        <div className="fixed inset-0 bg-white z-[60] overflow-y-auto flex flex-col">
          <div className="flex items-center px-4 h-16 border-b shrink-0 bg-white sticky top-0 z-10">
            <button onClick={() => { setSelectedGig(null); onToggleView?.(false); }} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-black">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter uppercase flex-1 truncate">{selectedGig.title}</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => handleShare(selectedGig)} 
                className="p-2 text-green-600 border border-green-200 rounded-full hover:bg-green-50 transition-colors"
                title="Share to WhatsApp"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {selectedGig.ownerId === profile.id && (
                <>
                  <button onClick={() => handleEdit(selectedGig)} className="p-2 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(selectedGig.id)} className="p-2 text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors">
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
                if (offset.x < -50) setCurrentImageIndex(prev => Math.min(prev + 1, selectedGig.images.length - 1));
                if (offset.x > 50) setCurrentImageIndex(prev => Math.max(prev - 1, 0));
              }}
            >
              <AnimatePresence mode="wait">
                <SafeImage
                  key={currentImageIndex}
                  className="w-full h-full object-cover"
                  src={selectedGig.images[currentImageIndex]} 
                  alt={`${selectedGig.title} - Image ${currentImageIndex + 1}`}
                  as={motion.img}
                  {...{
                    initial: { opacity: 0, x: 100 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -100 }
                  } as any}
                />
              </AnimatePresence>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-black bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                {currentImageIndex + 1} / {selectedGig.images.length}
              </div>
            </motion.div>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase mt-6">{selectedGig.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-100">{selectedGig.category}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">In {selectedGig.location}</span>
            </div>
            
            <p className="text-zinc-600 mt-4 leading-relaxed">{selectedGig.description}</p>
            <p className="mt-6 text-2xl font-black text-blue-600 italic tracking-tighter uppercase">Budget: {selectedGig.budget}</p>
            
            {selectedGig.ownerId !== profile.id ? (
              <button onClick={() => handleApply(selectedGig)} className="w-full mt-8 h-14 bg-zinc-900 text-white rounded-2xl font-black italic tracking-wider hover:bg-black transition-all shadow-xl active:scale-95">
                I CAN DO THiS
              </button>
            ) : (
              <div className="mt-8 p-4 bg-zinc-50 text-zinc-500 rounded-2xl text-center font-bold border border-zinc-100 uppercase tracking-widest text-xs">
                You posted this gig
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
                placeholder="Search gigs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button id="tour-post-gig" onClick={() => { setShowForm(true); setEditingGig(null); onToggleForm?.(true); }} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2">
              <BriefcaseBusiness size={16} />
              Post a Gig
            </button>
          </div>
          
          <ProvinceFilter selectedProvince={selectedProvince} onSelect={setSelectedProvince} />

          <div className="grid grid-cols-2 gap-4">
            {filteredGigs.map((g) => <GigCard key={g.id} gig={g} onApply={handleApply} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        </>
      ) : (
        <GigForm initialData={editingGig || undefined} onPost={handlePost} onCancel={() => { setShowForm(false); setEditingGig(null); onToggleForm?.(false); }} />
      )}
    </div>
  );
}
