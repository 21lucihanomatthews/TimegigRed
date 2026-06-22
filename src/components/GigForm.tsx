import { useState, ChangeEvent } from 'react';
import { Gig } from '../types';
import { Camera, X, ArrowLeft } from 'lucide-react';
import { PROVINCES } from '../constants';
import { useUser } from '../UserContext';
import SafeImage from './SafeImage';

interface Props {
  onPost: (gig: Gig) => void;
  onCancel: () => void;
  initialData?: Gig;
}

export default function GigForm({ onPost, onCancel, initialData }: Props) {
  const { profile } = useUser();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Casual');
  
  // Try to parse initial location if it follows "City, Province" format
  const initialLocationParts = initialData?.location.split(', ') || [];
  const initialCity = initialLocationParts[0] || '';
  const initialProvince = initialLocationParts[1] || PROVINCES[1];

  const [province, setProvince] = useState(initialProvince);
  const [location, setLocation] = useState(initialCity);
  const [budget, setBudget] = useState(initialData?.budget || '');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPost({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      location: `${location}, ${province}`,
      budget,
      images: imagePreviews,
      createdAt: initialData?.createdAt || new Date(),
      ownerId: initialData?.ownerId || profile.id,
      ownerName: initialData?.ownerName || `${profile.name} ${profile.surname}`,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 relative z-[60]">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-zinc-600" />
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">{initialData ? 'Edit Gig' : 'Post a New Gig'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Title</label>
          <input type="text" placeholder="Gig Title" className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Description</label>
          <textarea placeholder="Tell us what you need done..." className="w-full p-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Category</label>
          <select className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Casual</option>
            <option>Cleaning</option>
            <option>Delivery</option>
            <option>Other</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Location</label>
          <div className="grid grid-cols-2 gap-2">
            <select className="h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none appearance-none" value={province} onChange={(e) => setProvince(e.target.value)} required>
              {PROVINCES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" placeholder="Suburb/Area" className="h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Budget</label>
          <input type="text" placeholder="e.g. R500" className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none" value={budget} onChange={(e) => setBudget(e.target.value)} required />
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1 block mb-2">Upload Images</label>
          <div className="flex gap-3 flex-wrap mb-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-24 h-24 group">
                <SafeImage src={preview} alt="preview" className="w-full h-full object-cover rounded-xl shadow-md" />
                <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg scale-0 group-hover:scale-100 transition-transform"><X size={14} /></button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-zinc-400 hover:text-blue-500">
              <Camera size={28} />
              <span className="text-[10px] font-bold mt-1">ADD</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
        
        <div className="pt-4">
          <button type="submit" className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black italic tracking-wider hover:bg-black transition-all shadow-xl active:scale-95">
            {initialData ? 'UPDATE GiG' : 'POST GiG'}
          </button>
        </div>
      </form>
    </div>
  );
}
