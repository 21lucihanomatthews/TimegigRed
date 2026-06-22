import React from 'react';
import { AlertCircle, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorBannerProps {
  error: string;
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  const isSupabaseError = error.toLowerCase().includes('supabase') || error.toLowerCase().includes('relation');
  const isConfigMissing = error.toLowerCase().includes('configuration is missing');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-4 right-4 z-[60] bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-xl text-red-600">
          <AlertCircle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-black italic tracking-tighter uppercase text-red-900 mb-1">
            Database Connection Error
          </h3>
          <p className="text-red-700 text-sm leading-relaxed mb-3">
            {error}
          </p>
          
          {isConfigMissing && (
            <div className="bg-white/50 rounded-xl p-3 border border-red-100 mb-3">
              <p className="text-xs text-red-800 font-medium flex items-center gap-2 mb-2">
                <Terminal size={14} /> HOW TO FIX:
              </p>
              <ol className="text-xs text-red-700 list-decimal list-inside space-y-1">
                <li>Go to the <b>Secrets</b> panel in AI Studio</li>
                <li>Add <b>SUPABASE_URL</b> and <b>SUPABASE_ANON_KEY</b></li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}

          {isSupabaseError && !isConfigMissing && (
            <div className="bg-white/50 rounded-xl p-3 border border-red-100 mb-3">
              <p className="text-xs text-red-800 font-medium flex items-center gap-2 mb-2">
                <Terminal size={14} /> SCHEMA SETUP:
              </p>
              <p className="text-xs text-red-700">
                It looks like some tables are missing. Please ensure you have executed the <b>SCHEMA.sql</b> commands in your Supabase SQL Editor.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black italic tracking-tighter uppercase hover:bg-red-700 transition-colors"
            >
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
