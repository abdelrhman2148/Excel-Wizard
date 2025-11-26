
import React, { useState } from 'react';
import { ApiKey } from '../types';
import { getApiKeys, generateApiKey } from '../services/authService';
import { Copy, Plus, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const DeveloperPortal: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>(getApiKeys());

  const handleCreate = () => {
    const name = window.prompt("Name your API Key (e.g. 'Production App')");
    if (name) {
      const newKey = generateApiKey(name);
      setKeys(prev => [...prev, newKey]);
      toast.success("API Key Generated");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-gray-900 text-white p-8 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Terminal size={24} />
              Developer API
            </h2>
            <p className="text-gray-400 max-w-xl">
              Integrate Excel Wizard directly into your own applications. 
              Automate report generation and formula building programmatically.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-mono font-bold text-green-400">$0.002</div>
            <div className="text-sm text-gray-500">per request</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">API Keys</h3>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Plus size={16} />
            <span>Generate Key</span>
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No API keys found. Generate one to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {keys.map(k => (
              <div key={k.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{k.name}</div>
                  <div className="text-xs text-gray-400">Created {new Date(k.created).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm text-gray-600 font-mono">
                    {k.key.substring(0, 12)}...
                  </code>
                  <button onClick={() => copyKey(k.key)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Usage Analytics</h3>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300 text-gray-400 text-sm">
          Usage chart will appear here after your first API call.
        </div>
      </div>
    </div>
  );
};
