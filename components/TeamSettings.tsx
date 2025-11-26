
import React, { useState } from 'react';
import { X, Save, Users, Shield, Activity, Plus } from 'lucide-react';
import { TeamSettingsData, User } from '../types';
import { toast } from 'react-hot-toast';

interface TeamSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeamSettingsData;
  onSave: (s: TeamSettingsData) => void;
  currentUser: User | null;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({ isOpen, onClose, settings, onSave, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'audit'>('general');
  const [localSettings, setLocalSettings] = useState(settings);
  const [inviteEmail, setInviteEmail] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    toast.success("Settings Saved");
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Workspace Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-excel-600 text-excel-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-excel-600 text-excel-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Team Members
          </button>
          {currentUser?.plan === 'enterprise' && (
             <button 
               onClick={() => setActiveTab('audit')}
               className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'audit' ? 'border-excel-600 text-excel-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               Audit Logs
             </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">Global AI instructions for your team.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Functions</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-excel-400 outline-none"
                  value={localSettings.preferredFunctions}
                  onChange={(e) => setLocalSettings({...localSettings, preferredFunctions: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formatting Rules</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  value={localSettings.formattingRules}
                  onChange={(e) => setLocalSettings({...localSettings, formattingRules: e.target.value})}
                />
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {currentUser?.plan === 'free' ? (
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <Users className="mx-auto text-blue-500 mb-2" size={32} />
                  <h3 className="font-bold text-blue-900">Upgrade to Team Plan</h3>
                  <p className="text-sm text-blue-700 mt-1 mb-4">Invite unlimited members and share workflows.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="colleague@company.com" 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                    />
                    <button onClick={handleInvite} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Plus size={16} /> Invite
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500">Active Members</div>
                    <div className="divide-y divide-gray-100">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-excel-100 text-excel-700 flex items-center justify-center font-bold text-xs">YO</div>
                           <div>
                             <p className="text-sm font-medium text-gray-900">You (Owner)</p>
                             <p className="text-xs text-gray-500">{currentUser?.email}</p>
                           </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-gray-800 font-bold">
                 <Shield size={20} className="text-purple-600"/> Enterprise Audit Log
               </div>
               <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
                 <table className="w-full">
                   <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     <tr>
                       <th className="px-4 py-3">Action</th>
                       <th className="px-4 py-3">User</th>
                       <th className="px-4 py-3">Time</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     <tr><td className="px-4 py-3">Login</td><td className="px-4 py-3">{currentUser?.email}</td><td className="px-4 py-3 text-gray-500">Just now</td></tr>
                     <tr><td className="px-4 py-3">Generate Formula</td><td className="px-4 py-3">{currentUser?.email}</td><td className="px-4 py-3 text-gray-500">10 mins ago</td></tr>
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        {activeTab === 'general' && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 bg-excel-600 text-white px-6 py-2.5 rounded-xl hover:bg-excel-700 transition-colors font-medium shadow-sm"
            >
              <Save size={18} />
              <span>Save Preferences</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
