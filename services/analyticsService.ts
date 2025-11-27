
import { FeedbackLog } from '../types';

const EVENTS_KEY = 'excel_wizard_events';
const FEEDBACK_KEY = 'excel_wizard_feedback';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now()
    };
    
    // Store locally for now
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    events.push(event);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    
    // In a real app, you'd send this to Mixpanel/Amplitude/Google Analytics
    // console.log(`[Analytics] ${eventName}`, properties);
  } catch (e) {
    console.error('Analytics tracking failed', e);
  }
};

export const logFeedback = (feedback: FeedbackLog) => {
  try {
    const logs = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    logs.push(feedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(logs));
    
    // console.log(`[Feedback]`, feedback);
  } catch (e) {
    console.error('Feedback logging failed', e);
  }
};
