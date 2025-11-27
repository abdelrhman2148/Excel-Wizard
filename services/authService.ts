

import { User, PlanType } from '../types';

const STORAGE_KEY = 'excel_wizard_user_v1';
const API_KEYS_STORAGE = 'excel_wizard_api_keys';

export const DAILY_LIMIT_FREE = 5;

// Mock user database logic
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const user = JSON.parse(stored) as User;
  
  // Reset usage if new day
  const today = new Date().toISOString().split('T')[0];
  if (user.lastUsageDate !== today) {
    user.usageToday = 0;
    user.lastUsageDate = today;
    saveUser(user);
  }
  return user;
};

export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const loginMock = async (email: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create or retrieve user
  let user = getCurrentUser();
  if (!user || user.email !== email) {
    user = {
      id: 'usr_' + Date.now(),
      email,
      name: email.split('@')[0],
      plan: 'free', // Default to free
      usageToday: 0,
      lastUsageDate: new Date().toISOString().split('T')[0],
      organizationId: 'org_default',
      hasOnboarded: false
    };
  }
  saveUser(user);
  return user;
};

export const logoutMock = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const checkUsageLimit = (user: User): boolean => {
  if (user.plan !== 'free') return true; // Unlimited for paid plans
  return user.usageToday < DAILY_LIMIT_FREE;
};

export const incrementUsage = (user: User): User => {
  const updatedUser = { ...user, usageToday: user.usageToday + 1 };
  saveUser(updatedUser);
  return updatedUser;
};

export const upgradeUserPlan = (plan: PlanType): User | null => {
  const user = getCurrentUser();
  if (!user) return null;
  const updatedUser = { ...user, plan };
  saveUser(updatedUser);
  return updatedUser;
};

export const completeOnboarding = () => {
  const user = getCurrentUser();
  if (user) {
    const updatedUser = { ...user, hasOnboarded: true };
    saveUser(updatedUser);
  }
};

export const getApiKeys = () => {
  const stored = localStorage.getItem(API_KEYS_STORAGE);
  return stored ? JSON.parse(stored) : [];
};

export const generateApiKey = (name: string) => {
  const keys = getApiKeys();
  const newKey = {
    id: 'key_' + Date.now(),
    key: 'ew_' + Math.random().toString(36).substr(2, 24),
    name,
    created: Date.now(),
    lastUsed: 0
  };
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify([...keys, newKey]));
  return newKey;
};