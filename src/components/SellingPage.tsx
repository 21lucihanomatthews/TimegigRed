import { useState, useEffect } from 'react';
import { Search, Store } from 'lucide-react';
import { MarketItem } from '../types';
import { useData } from '../DataContext';
import { useUser } from '../UserContext';
import ItemForm from './ItemForm';
import ItemCard from './ItemCard';
import ItemDetailView from './ItemDetailView';
import ProvinceFilter from './ProvinceFilter';

interface Props {
  onToggleForm?: (isShowing: boolean) => void;
  onToggleView?: (isShowing: boolean) => void;
  onChatRequest?: (id: string, initialMessage?: string) => void;
}

export default function SellingPage({ onToggleForm, onToggleView, onChatRequest }: Props) {
  const { profile } = useUser();
  const { sellingItems: items, addSellingItem, updateSellingItem, deleteSellingItem } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [congratulate, setCongratulate] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'All Provinces' || i.location.toLowerCase().includes(selectedProvince.toLowerCase());

    return matchesSearch && matchesProvince;
  });

  const toggleForm = (show: boolean) => {
    setShowForm(show);
    onToggleForm?.(show);
    if (!show) setEditingItem(null);
  };

  const handlePost = (item: MarketItem) => {
    if (editingItem) {
      updateSellingItem(item);
      setEditingItem(null);
    } else {
      addSellingItem(item);
      setCongratulate(true);
      setTimeout(() => setCongratulate(false), 3000);
    }
    toggleForm(false);
  };

  const handleEdit = (item: MarketItem) => {
    setEditingItem(item);
    toggleForm(true);
  };

  const handleDelete = (id: string) => {
    deleteSellingItem(id);
    setSelectedItem(null);
    onToggleView?.(false);
    setDeletedMsg(true);
    setTimeout(() => setDeletedMsg(false), 2000);
  };

  if (selectedItem) {
    return (
      <ItemDetailView
        item={selectedItem}
        onBack={() => { setSelectedItem(null); onToggleView?.(false); }}
        isOwner={selectedItem.ownerId === profile.id}
        onEdit={() => handleEdit(selectedItem)}
        onDelete={() => handleDelete(selectedItem.id)}
        onChatRequest={(id, msg) => {
          setSelectedItem(null);
          onToggleView?.(false);
          onChatRequest?.(id, msg);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {congratulate && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold">
          Congratulations! Your item is now live in the market!
        </div>
      )}
      {deletedMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-bold">
          Item deleted successfully.
        </div>
      )}
      
      {!showForm ? (
        <>
          <div className="flex gap-2 items-center">
             <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search items to buy..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={() => toggleForm(true)} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2">
              <Store size={16} />
              Sell an Item
            </button>
          </div>

          <ProvinceFilter selectedProvince={selectedProvince} onSelect={setSelectedProvince} />

          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((i) => <ItemCard key={i.id} item={i} onClick={() => { setSelectedItem(i); onToggleView?.(true); }} onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        </>
      ) : (
        <ItemForm type="sell" onPost={handlePost} onCancel={() => toggleForm(false)} initialData={editingItem || undefined} />
      )}
    </div>
  );
}
