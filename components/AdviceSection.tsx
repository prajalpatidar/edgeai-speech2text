import React, { useState } from 'react';
import { chatWithExpert, generateAdvice } from '../services/geminiService';
import { Message } from '../types';
import { User, Bot, Send, Lightbulb, Loader2 } from 'lucide-react';

export const AdviceSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "I am your Embedded AI Assistant. I can help with NCNN state management, memory optimization for the Intel Atom, or Icefall training specifics. Ask me anything." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingAdvice, setStreamingAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await chatWithExpert(messages.concat(userMsg), input);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setLoading(false);
  };

  const handleGetStreamingAdvice = async () => {
      setLoadingAdvice(true);
      const advice = await generateAdvice(
          "Handling Streaming States in NCNN C++", 
          "The user is implementing a Zipformer loop in C++. They need to know how to manage the 'states' vector (LSTM/Conformer states) across audio frames using ncnn::Extractor, ensuring zero-copy or efficient swapping."
      );
      setStreamingAdvice(advice);
      setLoadingAdvice(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* Chat Interface */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="bg-slate-900 p-4 border-b border-slate-700 font-bold text-white flex items-center gap-2">
          <Bot className="text-blue-400" /> Expert Assistant
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
              <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Ask about quantization, cache..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Strategic Advice Panel */}
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" />
                Implementation Advice: Streaming States
            </h3>
            <p className="text-slate-400 text-sm mb-4">
                Streaming models require passing hidden states from the previous chunk to the current chunk. 
                Click below to generate a technical guide on handling this in NCNN.
            </p>
            {!streamingAdvice ? (
                <button 
                    onClick={handleGetStreamingAdvice}
                    disabled={loadingAdvice}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    {loadingAdvice ? <Loader2 className="animate-spin" size={16}/> : <Lightbulb size={16}/>}
                    Generate NCNN State Guide
                </button>
            ) : (
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-slate-300 text-sm font-mono whitespace-pre-wrap h-64 overflow-y-auto">
                    {streamingAdvice}
                </div>
            )}
        </div>

        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
            <h4 className="text-white font-semibold mb-2">Atom x86 Optimization Tips</h4>
            <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Use <code>taskset</code> to pin the inference thread to a specific core to avoid context switching.
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Enable flush-to-zero (FTZ) and denormals-are-zero (DAZ) in C++ to avoid slow floating point operations on the Atom.
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Since RAM is 200MB, ensure no other heavy daemons are running. Use <code>nice -n -20</code> for the audio process.
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};