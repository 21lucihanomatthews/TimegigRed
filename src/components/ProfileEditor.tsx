import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, ShieldCheck, CheckCircle2, Upload, AlertCircle, Trash2, Plus, Info, ArrowLeft } from 'lucide-react';
import { useUser, UserProfile } from '../UserContext';
import SafeImage from './SafeImage';

interface Props {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: Props) {
  const { profile, updateProfile, messages } = useUser();
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [socialLinkInput, setSocialLinkInput] = useState('');
  const [congratulate, setCongratulate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scanning States
  const [isScanningId, setIsScanningId] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'failed' | null>(null);

  const handleSave = () => {
    // Basic validation / update
    updateProfile({ ...formData, isVerified: true });
    setCongratulate(true);
    setTimeout(() => {
      setCongratulate(false);
      onClose();
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocial = () => {
    if (socialLinkInput.trim()) {
      setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, socialLinkInput.trim()] }));
      setSocialLinkInput('');
    }
  };

  const handleRemoveSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.name.trim() || !formData.surname.trim()) {
      alert("Please enter your First Name and Surname before uploading your ID document so we can match them.");
      return;
    }

    setIsScanningId(true);
    setScanResult(null);
    setScanProgress(15);
    setScanStatus('Analyzing Document Quality & Extracting Data...');

    setTimeout(() => {
      setScanProgress(40);
      setScanStatus(`Validating Name: scanning for "${formData.name.toUpperCase()} ${formData.surname.toUpperCase()}"...`);
      
      setTimeout(() => {
        setScanProgress(70);
        setScanStatus('Performing Biometric Match (Profile vs Document Photo)...');

        setTimeout(() => {
          // Mocking Success Path (Usually)
          const isMatch = Math.random() > 0.1; // 90% chance of success for UX
          const matchConfidence = isMatch 
            ? Math.floor(Math.random() * (98 - 72 + 1)) + 72 // 72-98%
            : Math.floor(Math.random() * (69 - 40 + 1)) + 40; // 40-69%

          setScanProgress(100);
          
          if (isMatch) {
            setScanResult('success');
            setScanStatus(`Match Confirmed! Confidence Score: ${matchConfidence}% (>70% required). Name validated.`);
            setTimeout(() => {
              setIsScanningId(false);
              setFormData(prev => ({ ...prev, idUploaded: true }));
            }, 3000);
          } else {
            setScanResult('failed');
            setScanStatus(`Verification Failed! Confidence Score: ${matchConfidence}% (<70% required). Face does not match.`);
            setTimeout(() => {
              setIsScanningId(false);
              // reset so they can try again
            }, 4000);
          }
        }, 3000);
      }, 2500);
    }, 2000);
  };

  if (congratulate) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Verified!</h2>
          <p className="text-gray-600 mb-6">Congratulations! Your profile has been updated and you are now fully verified with a red mark.</p>
          <div className="relative inline-block mx-auto">
             <SafeImage src={formData.avatarUrl} alt="Verified Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
             <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                <CheckCircle2 className="w-6 h-6 text-red-500 fill-red-500 stroke-white" />
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-gray-50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 border-b bg-white flex items-center gap-4 sticky top-0 z-10 text-black">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full shrink-0">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-tight">Edit Profile</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verification Status: {profile.isVerified ? 'Verified' : 'Pending'}</p>
          </div>
        </div>

        {isScanningId && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
            <div className="relative w-40 h-40 mb-6">
              <div className="absolute inset-0 border-4 border-dashed border-blue-200 rounded-2xl animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 border-4 border-blue-500 rounded-xl overflow-hidden shadow-2xl bg-gray-100">
                 <SafeImage src={formData.avatarUrl} alt="Avatar Match" className="w-full h-full object-cover" />
                 <motion.div 
                   initial={{ top: '-10%' }}
                   animate={{ top: '110%' }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                   className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_10px_2px_rgba(74,222,128,0.7)]"
                 />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing ID Document</h3>
            <p className="text-sm text-gray-600 mb-8 max-w-sm h-8 flex items-center justify-center">{scanStatus}</p>
            
            <div className="w-full max-w-sm bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                className={`h-2.5 rounded-full ${scanResult === 'failed' ? 'bg-red-500' : scanResult === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}
              />
            </div>
            
            {scanResult && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-8 flex flex-col items-center">
                 {scanResult === 'success' ? (
                   <div className="bg-green-100 text-green-700 p-3 rounded-full mb-2">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                 ) : (
                   <div className="bg-red-100 text-red-700 p-3 rounded-full mb-2">
                     <AlertCircle className="w-10 h-10" />
                   </div>
                 )}
              </motion.div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-8">
          {/* Avatar Section */}
          <section className="bg-white p-5 rounded-xl border shadow-sm">
             <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
               <div className="relative group">
                 <SafeImage src={formData.avatarUrl} alt="Avatar" className={`w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow ${profile.isVerified ? 'opacity-90' : ''}`} />
                 {!profile.isVerified && (
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
                   >
                      <Camera className="w-4 h-4" />
                   </button>
                 )}
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} disabled={profile.isVerified} onChange={handleImageUpload} />
               </div>
               <div className="flex-1 text-center sm:text-left">
                 <h3 className="text-sm font-semibold text-gray-900 mb-1">Face Picture</h3>
                 <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded flex items-start gap-2 border border-blue-100">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>A clear face picture is required to verify your identity, build trust in the community, and help match you with better opportunities.</span>
                  </p>
                  <div className="flex gap-2">
                    <div className="bg-gray-50 px-3 py-2 rounded-lg border text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Sent</p>
                      <p className="text-sm font-bold text-gray-900">{messages.filter(m => m.fromId === profile.id).length} Sent</p>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg border text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-gray-500">Balance</p>
                      <p className="text-sm font-bold text-gray-900">{profile.balance}c</p>
                    </div>
                  </div>
                  <p className="hidden">
                 </p>
               </div>
             </div>
          </section>

           {/* Personal Information */}
          <section className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
               <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
               {profile.isVerified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified & Locked</span>}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                 <input type="text" value={formData.name} readOnly={profile.isVerified} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none ${profile.isVerified ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-2 focus:ring-blue-500'}`} />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
                 <input type="text" value={formData.middleName} readOnly={profile.isVerified} onChange={e => setFormData({...formData, middleName: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none ${profile.isVerified ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-2 focus:ring-blue-500'}`} placeholder="Optional" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Surname</label>
                 <input type="text" value={formData.surname} readOnly={profile.isVerified} onChange={e => setFormData({...formData, surname: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none ${profile.isVerified ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-2 focus:ring-blue-500'}`} />
               </div>
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Contact Information (Email / Phone)</label>
               <input type="text" value={formData.contact} readOnly={profile.isVerified} onChange={e => setFormData({...formData, contact: e.target.value})} className={`w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none ${profile.isVerified ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-2 focus:ring-blue-500'}`} />
             </div>
          </section>

          {/* Social Links */}
          <section className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Social Network Links</h3>
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://linkedin.com/in/username" 
                value={socialLinkInput}
                onChange={e => setSocialLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSocial()}
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleAddSocial}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border">
                  <span className="text-sm text-gray-700 truncate mr-4">{link}</span>
                  <button onClick={() => handleRemoveSocial(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded transition shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Documents */}
          <section className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
             <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Documents & Uploads</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CV */}
                <div className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition ${profile.isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={profile.isVerified} onChange={() => setFormData(prev => ({...prev, cvUploaded: true}))} />
                  <div className={`p-3 rounded-full ${formData.cvUploaded ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {formData.cvUploaded ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">CV Document</h4>
                    <p className="text-xs text-gray-500">{formData.cvUploaded ? 'Uploaded successfully' : 'PDF, DOCX up to 5MB'}</p>
                  </div>
                </div>

                {/* Certificates */}
                <div className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition ${profile.isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={profile.isVerified} onChange={() => setFormData(prev => ({...prev, certificatesUploaded: true}))} />
                  <div className={`p-3 rounded-full ${formData.certificatesUploaded ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {formData.certificatesUploaded ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Certificates</h4>
                    <p className="text-xs text-gray-500">{formData.certificatesUploaded ? 'Uploaded successfully' : 'Optional qualifications'}</p>
                  </div>
                </div>

                {/* ID Document (Important) */}
                <div className={`border border-red-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden bg-red-50 hover:bg-red-100 transition ${profile.isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} sm:col-span-2`}>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={profile.isVerified} onChange={handleIdUpload} />
                  <div className={`p-3 rounded-full ${formData.idUploaded ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {formData.idUploaded ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800 flex items-center justify-center gap-1">
                      ID Document <span className="text-[10px] bg-red-600 text-white px-1.5 rounded uppercase tracking-wider">Required</span>
                    </h4>
                    <p className="text-xs text-red-600 mt-0.5">{formData.idUploaded ? 'ID verified and uploaded' : 'Government-issued ID or Passport'}</p>
                  </div>
                </div>

             </div>
          </section>

        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
           {profile.isVerified ? (
             <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition">
               Done
             </button>
           ) : (
             <>
               <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                 Cancel
               </button>
               <button 
                onClick={handleSave} 
                disabled={!formData.idUploaded || !formData.name}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
               >
                 Save & Verify Profile
               </button>
             </>
           )}
        </div>
      </motion.div>
    </div>
  );
}
