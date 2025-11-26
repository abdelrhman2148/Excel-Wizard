import React from 'react';
import { AnalyticsData } from '../types';

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const successRate = data.totalFeedback > 0 
    ? Math.round((data.helpfulCount / data.totalFeedback) * 100) 
    : 100; // Default to 100 optimism for zero data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900">{data.requestCount}</span>
        <span className="text-sm text-gray-500 font-medium">Formulas Generated</span>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
        <span className="text-3xl font-bold text-excel-600">{successRate}%</span>
        <span className="text-sm text-gray-500 font-medium">User Success Rate</span>
      </div>

       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
        <span className="text-3xl font-bold text-blue-600">24/7</span>
        <span className="text-sm text-gray-500 font-medium">Availability</span>
      </div>
    </div>
  );
};