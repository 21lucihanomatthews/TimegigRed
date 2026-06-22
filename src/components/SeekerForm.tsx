import React, { useState, ChangeEvent } from 'react';
import { Seeker } from '../types';
import { Camera, Video, X, Plus, ArrowLeft } from 'lucide-react';
import { PROVINCES } from '../constants';
import SafeImage from './SafeImage';
import { useUser } from '../UserContext';

interface Props {
  onPost: (seeker: Seeker) => void;
  onCancel: () => void;
  initialData?: Seeker;
}

export default function SeekerForm({ onPost, onCancel, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Try to parse initial location if it follows "City, Province" format
  const initialLocationParts = initialData?.location.split(', ') || [];
  const initialCity = initialLocationParts[0] || '';
  const initialProvince = initialLocationParts[1] || PROVINCES[1];

  const [province, setProvince] = useState(initialProvince);
  const [location, setLocation] = useState(initialCity);
  const [rate, setRate] = useState(initialData?.rate || '');
  const [contactInfo, setContactInfo] = useState(initialData?.contactInfo || '');
  const [socialMedia, setSocialMedia] = useState<string[]>(initialData?.socialMedia || ['']);
  const [websiteUrl, setWebsiteUrl] = useState<string[]>(initialData?.websiteUrl || ['']);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map((file) => URL.createObjectURL(file as unknown as Blob));
      setImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map((file) => URL.createObjectURL(file as unknown as Blob));
      setVideos((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
  const removeVideo = (index: number) => setVideos((prev) => prev.filter((_, i) => i !== index));

  const { profile } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPost({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      ownerId: initialData?.ownerId || profile.id,
      name,
      description,
      location: `${location}, ${province}`,
      rate,
      images,
      videos,
      contactInfo,
      socialMedia: socialMedia.filter(s => s.trim() !== ''),
      websiteUrl: websiteUrl.filter(w => w.trim() !== ''),
      createdAt: initialData?.createdAt || new Date(),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 relative z-[60]">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-zinc-600" />
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">{initialData ? 'Edit' : 'Create'} Seeker Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Name</label>
          <input type="text" placeholder="Your Name" className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Description</label>
          <textarea placeholder="Describe your services..." className="w-full p-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Rate</label>
          <input type="text" placeholder="e.g. R200/hr" className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none" value={rate} onChange={(e) => setRate(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Contact Info</label>
          <input type="text" placeholder="Phone or Email" className="w-full h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
        </div>
        
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1 block">Social Media Links</label>
          {socialMedia.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input type="url" className="flex-1 h-12 px-4 border border-zinc-100 rounded-xl bg-zinc-50 focus:bg-white transition-all outline-none" value={url} onChange={(e) => { const n = [...socialMedia]; n[i] = e.target.value; setSocialMedia(n); }} placeholder="https://..." />
              <button type="button" onClick={() => setSocialMedia(prev => prev.filter((_, idx) => idx !== i))} className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><X size={18}/></button>
            </div>
          ))}
          <button type="button" onClick={() => setSocialMedia(prev => [...prev, ''])} className="flex items-center gap-2 text-xs font-bold text-blue-600 px-1 hover:text-blue-700"><Plus size={16}/> ADD SOCIAL LINK</button>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1 block">Portfolio Images</label>
          <div className="flex gap-3 flex-wrap mb-2">
            {images.map((preview, index) => (
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
        
        <div className="pt-6">
          <button type="submit" className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black italic tracking-wider hover:bg-black transition-all shadow-xl active:scale-95">
            {initialData ? 'UPDATE PROFiLE' : 'POST PROFiLE'}
          </button>
        </div>
      </form>
    </div>
  );
}
