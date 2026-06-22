import { PROVINCES } from '../constants';
import { motion } from 'motion/react';

interface Props {
  selectedProvince: string;
  onSelect: (province: string) => void;
}

export default function ProvinceFilter({ selectedProvince, onSelect }: Props) {
  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none no-scrollbar">
      {PROVINCES.map((province) => (
        <motion.button
          key={province}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(province)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedProvince === province
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {province}
        </motion.button>
      ))}
    </div>
  );
}
