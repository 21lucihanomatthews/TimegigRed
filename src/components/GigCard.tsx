import { Gig } from '../types';
import { useUser } from '../UserContext';
import { Edit2, Trash2 } from 'lucide-react';
import SafeImage from './SafeImage';

interface Props {
  gig: Gig;
  onApply: (gig: Gig) => void;
  onView: (gig: Gig) => void;
  onEdit?: (gig: Gig) => void;
  onDelete?: (id: string) => void;
}

export default function GigCard({ gig, onApply, onView, onEdit, onDelete }: Props) {
  const { profile } = useUser();
  const isOwner = gig.ownerId === profile.id;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4 relative">
      <div className="flex gap-2 overflow-x-auto cursor-pointer" onClick={() => onView(gig)}>
        {gig.images.slice(0, 3).map((img, i) => (
          <SafeImage key={i} src={img} alt={gig.title} className="w-1/3 h-24 object-cover rounded" />
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold truncate" title={gig.title} onClick={() => onView(gig)}>{gig.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{gig.description}</p>
        <div className="text-xs text-gray-500">
          <p>Category: {gig.category}</p>
          <p>Location: {gig.location}</p>
          <p className="font-semibold text-blue-600">Budget: {gig.budget}</p>
        </div>
        
        {isOwner ? (
          <div className="flex gap-2 mt-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(gig); }} 
            className="flex-1 flex items-center justify-center gap-1 p-2 bg-gray-100 text-gray-700 rounded text-sm active:bg-gray-200"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(gig.id); }} 
            className="flex-1 flex items-center justify-center gap-1 p-2 bg-red-50 text-red-600 rounded text-sm active:bg-red-100"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          </div>
        ) : (
          <button onClick={() => onApply(gig)} className="w-full mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            I can do
          </button>
        )}
      </div>
    </div>
  );
}
