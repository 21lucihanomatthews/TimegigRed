import { MarketItem } from '../types';
import { ArrowLeft, Edit2, Trash2, Share2 } from 'lucide-react';
import SafeImage from './SafeImage';

interface Props {
  item: MarketItem;
  onBack: () => void;
  onChatRequest: (ownerId: string, initialMessage?: string) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ItemDetailView({ item, onBack, onChatRequest, isOwner, onEdit, onDelete }: Props) {
  const handleShare = async () => {
    const shareText = `Check out this ${item.type === 'sell' ? 'item for sale' : 'wanted item'}: ${item.title} - ${item.price}. ${item.description}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
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

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-4 h-16 border-b shrink-0 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-black">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black italic tracking-tighter uppercase flex-1 truncate">{item.title}</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleShare} 
            className="p-2 text-green-600 border border-green-200 rounded-full hover:bg-green-50 transition-colors"
            title="Share to WhatsApp"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {isOwner && (
            <>
              <button onClick={onEdit} className="p-2 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete?.()} className="p-2 text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-24">
        {item.images.length > 0 ? (
          <div className="w-full h-64 bg-gray-100 flex overflow-x-auto snap-x">
            {item.images.map((img, i) => (
              <SafeImage key={i} src={img} alt={item.title} className="w-full h-full object-cover shrink-0 snap-center" />
            ))}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No images</span>
          </div>
        )}

        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <p className="text-lg font-semibold text-blue-600 mt-1">{item.price}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{item.location}</span>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t pb-8 flex gap-3">
        {isOwner ? (
          <div className="w-full p-4 bg-gray-100 text-gray-500 rounded text-center font-semibold border dashed">
            You posted this {item.type === 'sell' ? 'item for sale' : 'wanted request'}
          </div>
        ) : (
          <>
            {item.type === 'sell' ? (
              <>
                <button
                  onClick={() => onChatRequest(item.ownerId || '1', `Hi, I'm interested in your item: ${item.title}`)}
                  className="flex-1 bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg flex items-center justify-center border border-gray-200"
                >
                  Interested
                </button>
                <button
                  onClick={() => onChatRequest(item.ownerId || '1', `Hi, I want to buy your item: ${item.title}`)}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
                >
                  Buy Now
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onChatRequest(item.ownerId || '1', `Hi, I know something about the item you are looking for: ${item.title}`)}
                  className="flex-1 bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg flex items-center justify-center border border-gray-200"
                >
                  I know
                </button>
                <button
                  onClick={() => onChatRequest(item.ownerId || '1', `Hi, I have the item you are looking for: ${item.title}`)}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
                >
                  I have it
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
