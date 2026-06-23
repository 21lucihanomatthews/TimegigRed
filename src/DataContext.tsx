import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gig, Seeker, MarketItem } from './types';

interface DataContextType {
  gigs: Gig[];
  addGig: (gig: Gig) => void;
  updateGig: (gig: Gig) => void;
  deleteGig: (id: string) => void;
  seekers: Seeker[];
  addSeeker: (seeker: Seeker) => void;
  updateSeeker: (seeker: Seeker) => void;
  deleteSeeker: (id: string) => void;
  sellingItems: MarketItem[];
  addSellingItem: (item: MarketItem) => void;
  updateSellingItem: (item: MarketItem) => void;
  deleteSellingItem: (id: string) => void;
  wantedItems: MarketItem[];
  addWantedItem: (item: MarketItem) => void;
  updateWantedItem: (item: MarketItem) => void;
  deleteWantedItem: (id: string) => void;
  error: string | null;
}

const MOCK_GIGS: Gig[] = [];

const MOCK_SEEKERS: Seeker[] = [];

const MOCK_SELLING: MarketItem[] = [];

const MOCK_WANTED: MarketItem[] = [];


const DataContext = createContext<DataContextType>({
  gigs: MOCK_GIGS,
  addGig: () => {},
  updateGig: () => {},
  deleteGig: () => {},
  seekers: MOCK_SEEKERS,
  addSeeker: () => {},
  updateSeeker: () => {},
  deleteSeeker: () => {},
  sellingItems: MOCK_SELLING,
  addSellingItem: () => {},
  updateSellingItem: () => {},
  deleteSellingItem: () => {},
  wantedItems: MOCK_WANTED,
  addWantedItem: () => {},
  updateWantedItem: () => {},
  deleteWantedItem: () => {},
  error: null,
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const [seekers, setSeekers] = useState<Seeker[]>(MOCK_SEEKERS);
  const [sellingItems, setSellingItems] = useState<MarketItem[]>(MOCK_SELLING);
  const [wantedItems, setWantedItems] = useState<MarketItem[]>(MOCK_WANTED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/gigs').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText }))),
          fetch('/api/seekers').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText }))),
          fetch('/api/market-items').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText })))
        ]);
        
        const [gigsRes, seekersRes, marketRes] = responses;

        if (gigsRes?.error || seekersRes?.error || marketRes?.error) {
          setError(gigsRes?.error || seekersRes?.error || marketRes?.error);
        }
        
        setGigs(Array.isArray(gigsRes) ? gigsRes : []);
        setSeekers(Array.isArray(seekersRes) ? seekersRes : []);
        
        const marketItems = Array.isArray(marketRes) ? marketRes : [];
        setSellingItems(marketItems.filter((i: MarketItem) => i.type === 'sell'));
        setWantedItems(marketItems.filter((i: MarketItem) => i.type === 'want'));
      } catch (err: any) {
        console.error('Failed to fetch data', err);
        setError(err.message || "Failed to connect to server");
      }
    };
    fetchData();
  }, []);

  const addGig = async (gig: Gig) => {
    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gig)
      });
      if (res.ok) {
        const saved = await res.json();
        setGigs(prev => [saved, ...prev]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to add gig');
      }
    } catch (err: any) {
      console.error('Failed to add gig', err);
      // alert(`Error: ${err.message}`); // Avoid window.alert if possible, but keeping it as it was there? Actually guidelines say avoid alert.
    }
  };

  const updateGig = async (gig: Gig) => {
    try {
      const res = await fetch(`/api/gigs/${gig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gig)
      });
      if (res.ok) {
        const saved = await res.json();
        setGigs(prev => prev.map(g => g.id === saved.id ? saved : g));
      }
    } catch (err) {
      console.error('Failed to update gig', err);
    }
  };

  const deleteGig = async (id: string) => {
    try {
      await fetch(`/api/gigs/${id}`, { method: 'DELETE' });
      setGigs(prev => prev.filter(g => String(g.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete gig', err);
    }
  };

  const addSeeker = async (seeker: Seeker) => {
    try {
      const res = await fetch('/api/seekers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seeker)
      });
      if (res.ok) {
        const saved = await res.json();
        setSeekers(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add seeker', err);
    }
  };

  const updateSeeker = async (seeker: Seeker) => {
    try {
      const res = await fetch(`/api/seekers/${seeker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seeker)
      });
      if (res.ok) {
        const saved = await res.json();
        setSeekers(prev => prev.map(s => s.id === saved.id ? saved : s));
      }
    } catch (err) {
      console.error('Failed to update seeker', err);
    }
  };

  const deleteSeeker = async (id: string) => {
    try {
      await fetch(`/api/seekers/${id}`, { method: 'DELETE' });
      setSeekers(prev => prev.filter(s => String(s.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete seeker', err);
    }
  };

  const addSellingItem = async (item: MarketItem) => {
    try {
      const res = await fetch('/api/market-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const saved = await res.json();
        setSellingItems(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add selling item', err);
    }
  };

  const updateSellingItem = async (item: MarketItem) => {
    try {
      const res = await fetch(`/api/market-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const saved = await res.json();
        setSellingItems(prev => prev.map(i => i.id === saved.id ? saved : i));
      }
    } catch (err) {
      console.error('Failed to update selling item', err);
    }
  };

  const deleteSellingItem = async (id: string) => {
    try {
      await fetch(`/api/market-items/${id}`, { method: 'DELETE' });
      setSellingItems(prev => prev.filter(i => String(i.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete selling item', err);
    }
  };

  const addWantedItem = async (item: MarketItem) => {
    try {
      const res = await fetch('/api/market-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const saved = await res.json();
        setWantedItems(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add wanted item', err);
    }
  };

  const updateWantedItem = async (item: MarketItem) => {
    try {
      const res = await fetch(`/api/market-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const saved = await res.json();
        setWantedItems(prev => prev.map(i => i.id === saved.id ? saved : i));
      }
    } catch (err) {
      console.error('Failed to update wanted item', err);
    }
  };

  const deleteWantedItem = async (id: string) => {
    try {
      await fetch(`/api/market-items/${id}`, { method: 'DELETE' });
      setWantedItems(prev => prev.filter(i => String(i.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete wanted item', err);
    }
  };

  return (
    <DataContext.Provider value={{
      gigs, addGig, updateGig, deleteGig,
      seekers, addSeeker, updateSeeker, deleteSeeker,
      sellingItems, addSellingItem, updateSellingItem, deleteSellingItem,
      wantedItems, addWantedItem, updateWantedItem, deleteWantedItem,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
};
