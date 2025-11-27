
import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Copy, Wrench } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-excel-500" />,
      title: "1. Describe Your Task",
      desc: "Just type what you need in plain English. Example: 'Sum Column A if Column B is Approved'.",
      color: "bg-excel-50"
    },
    {
      icon: <Wrench className="w-12 h-12 text-amber-500" />,
      title: "2. Get Instant Formulas",
      desc: "The AI generates the perfect Excel or Google Sheets formula instantly, with an explanation.",
      color: "bg-amber-50"
    },
    {
      icon: <Copy className="w-12 h-12 text-blue-500" />,
      title: "3. Copy & Go",
      desc: "Click 'Copy' or press 'C' to grab the result. You can also upload files for deep analysis.",
      color: "bg-blue-50"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        
        <div className="p-8 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 transition-colors duration-500 ${steps[step].color}`}>
            {steps[step].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{steps[step].title}</h2>
          <p className="text-gray-500 text-lg leading-relaxed h-20">{steps[step].desc}</p>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex space-x-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'}`} />
            ))}
          </div>

          <button 
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else onClose();
            }}
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95"
          >
            <span>{step === steps.length - 1 ? "Get Started" : "Next"}</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};
