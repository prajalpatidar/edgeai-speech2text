import React, { useState } from 'react';
import { View } from './types';
import { DataPrep } from './components/DataPrep';
import { TrainingConfig } from './components/TrainingConfig';
import { ExportWorkflow } from './components/ExportWorkflow';
import { InferenceCode } from './components/InferenceCode';
import { AdviceSection } from './components/AdviceSection';
import { 
  Database, 
  Activity, 
  Box, 
  Cpu, 
  MessageSquare, 
  Menu,
  X,
  Server
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DATA_PREP);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case View.DATA_PREP: return <DataPrep />;
      case View.TRAINING: return <TrainingConfig />;
      case View.EXPORT: return <ExportWorkflow />;
      case View.INFERENCE: return <InferenceCode />;
      case View.ADVICE: return <AdviceSection />;
      default: return <DataPrep />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-600 rounded-lg">
                <Server size={24} />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-tight">Zipformer<br/>Forge</h1>
                <p className="text-xs text-blue-400 font-mono">EMBEDDED AI</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Workflow</div>
          <NavItem view={View.DATA_PREP} icon={Database} label="1. Data Prep" />
          <NavItem view={View.TRAINING} icon={Activity} label="2. Training" />
          <NavItem view={View.EXPORT} icon={Box} label="3. Export" />
          <NavItem view={View.INFERENCE} icon={Cpu} label="4. C++ Inference" />
          
          <div className="mt-8 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Support</div>
          <NavItem view={View.ADVICE} icon={MessageSquare} label="Ask Expert" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-xs text-slate-400">System Ready</p>
          </div>
           <p className="text-[10px] text-slate-600 mt-2">v1.0.0 • Ubuntu/Atom Target</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto bg-[#0f172a] relative">
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4">
           <h2 className="text-xl font-bold text-white">
             {currentView === View.DATA_PREP && 'Dataset Preparation'}
             {currentView === View.TRAINING && 'Training Configuration'}
             {currentView === View.EXPORT && 'Export & Quantization'}
             {currentView === View.INFERENCE && 'Embedded Inference'}
             {currentView === View.ADVICE && 'Expert Advice'}
           </h2>
        </header>
        
        <main className="p-8 max-w-5xl mx-auto pb-20">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;