
import React from 'react';
import { TemplateItem } from '../types';
import { ShoppingCart, Download, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOCK_TEMPLATES: TemplateItem[] = [
  { id: 't1', title: 'SaaS Financial Model', description: 'Complete 5-year projection with MRR, Churn, and CAC analysis.', price: 29, category: 'Finance', purchased: false, steps: [] },
  { id: 't2', title: 'SEO Content Planner', description: 'Track keywords, content status, and automated publishing dates.', price: 0, category: 'Marketing', purchased: false, steps: [] },
  { id: 't3', title: 'Inventory Management', description: 'Stock tracking with reorder alerts and vendor database.', price: 15, category: 'Operations', purchased: false, steps: [] },
  { id: 't4', title: 'Project Gantt Chart', description: 'Dynamic timeline visualization with dependency tracking.', price: 19, category: 'Project Management', purchased: false, steps: [] },
];

interface MarketplaceProps {
  onPurchase: (template: TemplateItem) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onPurchase }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold mb-2">Template Store</h2>
        <p className="text-purple-100 max-w-xl">
          Jumpstart your workflow with expert-designed templates. Built by pros, automated by AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TEMPLATES.map(template => (
          <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="h-32 bg-gray-100 flex items-center justify-center border-b border-gray-100">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl">
                📄
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">{template.category}</span>
                 {template.price === 0 && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">FREE</span>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{template.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">{template.description}</p>
              
              <button 
                onClick={() => {
                  toast.success(`Purchased ${template.title}!`);
                  onPurchase(template);
                }}
                className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                {template.price === 0 ? (
                  <>
                    <Download size={16} />
                    <span>Download</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Buy for ${template.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
