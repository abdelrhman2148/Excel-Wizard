
import React from 'react';
import { X, Check, Zap, Building, Crown } from 'lucide-react';
import { PlanType } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: PlanType) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleSubscribe = (plan: PlanType) => {
    // Simulate Stripe Checkout Redirect
    const btn = document.getElementById(`btn-${plan}`);
    if(btn) btn.innerHTML = "Redirecting to Stripe...";
    
    setTimeout(() => {
      onConfirm(plan);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-fade-in-up my-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade your Workspace</h2>
            <p className="text-gray-500 text-sm">Choose the plan that fits your needs.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* PRO PLAN */}
          <div className="p-8 flex flex-col hover:bg-gray-50/50 transition-colors">
            <div className="mb-4">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Most Popular</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" fill="currentColor" /> Pro
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$19</span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-green-500" /> Unlimited Formulas</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-green-500" /> File Upload & Analysis</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-green-500" /> Formula Debugger</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-green-500" /> Google Sheets Support</li>
            </ul>
            <button 
              id="btn-pro"
              onClick={() => handleSubscribe('pro')}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* TEAM PLAN */}
          <div className="p-8 flex flex-col hover:bg-gray-50/50 transition-colors">
            <div className="mb-4">
               <h3 className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                <Building size={20} className="text-blue-500" /> Team
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$49</span>
                <span className="text-gray-500 ml-1">/mo</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">includes 5 seats</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-blue-500" /> Everything in Pro</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-blue-500" /> Shared History</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-blue-500" /> Team Library</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-blue-500" /> Central Billing</li>
            </ul>
            <button 
               id="btn-team"
               onClick={() => handleSubscribe('team')}
               className="w-full py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-gray-900 transition-all active:scale-95"
            >
              Start Team Trial
            </button>
          </div>

           {/* ENTERPRISE */}
           <div className="p-8 flex flex-col hover:bg-gray-50/50 transition-colors">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                <Crown size={20} className="text-purple-500" /> Enterprise
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">Custom</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-purple-500" /> SSO (Okta, AD)</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-purple-500" /> Audit Logs</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-purple-500" /> SLA Support</li>
              <li className="flex items-center text-sm text-gray-600 gap-2"><Check size={16} className="text-purple-500" /> Private Cloud</li>
            </ul>
            <button 
               onClick={() => window.open('mailto:sales@excelwizard.ai')}
               className="w-full py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-purple-600 hover:text-purple-600 transition-all active:scale-95"
            >
              Contact Sales
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
          Secure payment processing by Stripe. You can cancel at any time.
        </div>
      </div>
    </div>
  );
};
