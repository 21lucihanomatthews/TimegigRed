import { Seeker } from '../types';
import { useUser } from '../UserContext';
import { Edit2, Trash2 } from 'lucide-react';
import SafeImage from './SafeImage';

interface Props {
  seeker: Seeker;
  onView: (seeker: Seeker) => void;
  onEdit?: (seeker: Seeker) => void;
  onDelete?: (id: string) => void;
  onHire?: (seeker: Seeker) => void;
}

export default function SeekerCard({ seeker, onView, onEdit, onDelete, onHire }: Props) {
  const { profile } = useUser();
  const isOwner = seeker.ownerId === profile.id;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4 relative">
      <div className="flex gap-2 overflow-x-auto cursor-pointer" onClick={() => onView(seeker)}>
        {seeker.images.slice(0, 3).map((img, i) => (
          <SafeImage key={i} src={img} alt={seeker.name} className="w-1/3 h-24 object-cover rounded" />
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold cursor-pointer truncate" title={seeker.name} onClick={() => onView(seeker)}>{seeker.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{seeker.description}</p>
        <div className="text-xs text-gray-500">
          <p>Location: {seeker.location}</p>
          <p className="font-semibold text-blue-600">Rate: {seeker.rate}</p>
        </div>
        
        {isOwner ? (
          <div className="flex gap-2 mt-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(seeker); }} 
            className="flex-1 flex items-center justify-center gap-1 p-2 bg-gray-100 text-gray-700 rounded text-sm active:bg-gray-200"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(seeker.id); }} 
            className="flex-1 flex items-center justify-center gap-1 p-2 bg-red-50 text-red-600 rounded text-sm active:bg-red-100"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          </div>
        ) : (
          <div className="space-y-4 mt-auto">
            <div className="text-xs text-gray-400">
              <p>Contact: {seeker.contactInfo}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onHire?.(seeker); }}
              className="w-full py-2 bg-blue-600 text-white rounded font-bold text-sm shadow-sm active:scale-95 transition-transform"
            >
              Hire Seeker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
