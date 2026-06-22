import { MarketItem } from '../types';
import { useUser } from '../UserContext';
import { Edit2, Trash2 } from 'lucide-react';
import SafeImage from './SafeImage';

interface Props {
  item: MarketItem;
  onClick?: () => void;
  onEdit?: (item: MarketItem) => void;
  onDelete?: (id: string) => void;
}

export default function ItemCard({ item, onClick, onEdit, onDelete }: Props) {
  const { profile } = useUser();
  const isOwner = item.ownerId === profile.id;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-2 relative hover:shadow-md transition-shadow group" onClick={onClick}>
      <div className="flex gap-2 overflow-x-auto">
        {item.images.slice(0, 3).map((img, i) => (
          <SafeImage key={i} src={img} alt={item.title} className="w-1/3 h-24 object-cover rounded" />
        ))}
      </div>
      <h3 className="text-lg font-bold truncate" title={item.title}>{item.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
      <div className="text-sm font-semibold text-blue-600">{item.price}</div>
      <div className="text-xs text-gray-400">{item.location}</div>
      
      {isOwner && (
        <div className="flex gap-1 mt-2 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} 
            className="flex-1 flex items-center justify-center p-1.5 bg-gray-100 text-gray-700 rounded text-xs active:bg-gray-200"
          >
            <Edit2 className="w-3 h-3 mr-1" /> Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }} 
            className="flex-1 flex items-center justify-center p-1.5 bg-red-50 text-red-600 rounded text-xs active:bg-red-100"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
