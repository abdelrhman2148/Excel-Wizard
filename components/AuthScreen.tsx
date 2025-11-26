
import React, { useState } from 'react';
import { FileSpreadsheet, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      onLogin(email);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 pb-6 text-center">
          <div className="w-12 h-12 bg-excel-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-excel-200">
            <FileSpreadsheet size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Excel Wizard</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to automate your spreadsheet workflows.</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-excel-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-excel-500 focus:bg-white outline-none transition-all text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-transform active:scale-95 shadow-lg shadow-gray-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400 font-medium">OR</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
          
          <button className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <img src="https://www.svgrepo.com/show/452263/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
            <span>Single Sign-On (SSO)</span>
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            By clicking continue, you agree to our <a href="#" className="underline hover:text-gray-800">Terms of Service</a> and <a href="#" className="underline hover:text-gray-800">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
