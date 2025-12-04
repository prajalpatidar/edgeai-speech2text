import React, { useState, useEffect } from 'react';
import { ModelConfig } from '../types';
import { CodeBlock } from './CodeBlock';
import { Cpu, MemoryStick, Activity } from 'lucide-react';

export const TrainingConfig: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>({
    numEncoderLayers: 12,
    encoderDim: 192,
    queryHeadDim: 24,
    datasetPath: 'data/fbank',
    batchSize: 16 // Good for RTX 5060 for small models
  });

  const [estimatedRam, setEstimatedRam] = useState(0);

  useEffect(() => {
    // Very rough heuristic for quantized inference RAM usage
    // Weights + Runtime buffers + Beam Search overhead
    // Base overhead ~40MB
    const weights = (config.numEncoderLayers * config.encoderDim * config.encoderDim * 4) / 1024 / 1024; // MB (Float32 estimate)
    const quantizedWeights = weights / 4; // Int8
    const buffers = (config.encoderDim * 20) / 1024; // Runtime buffers
    const total = 40 + quantizedWeights + buffers;
    setEstimatedRam(Math.round(total));
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'datasetPath' ? value : Number(value)
    }));
  };

  const trainCommand = `
export CUDA_VISIBLE_DEVICES="0"

# Note: Using optimized parameters for 200MB target
./pruned_transducer_stateless7_streaming/train.py \\
  --world-size 1 \\
  --num-epochs 30 \\
  --start-epoch 1 \\
  --exp-dir "exp/tiny_zipformer" \\
  --full-libri 0 \\
  --max-duration 300 \\
  --enable-musan True \\
  --manifest-dir "${config.datasetPath}" \\
  --num-encoder-layers ${config.numEncoderLayers} \\
  --encoder-dim ${config.encoderDim} \\
  --query-head-dim ${config.queryHeadDim} \\
  --rnn-hidden-state-dim ${config.encoderDim} \\
  --batch-size ${config.batchSize} \\
  --lr-factor 5.0 \\
  --decode-interval 1000 
  `.trim();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Config Panel */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="text-blue-400" />
            Model Hyperparameters
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Encoder Layers
                <span className="text-blue-400">{config.numEncoderLayers}</span>
              </label>
              <input
                type="range"
                name="numEncoderLayers"
                min="2"
                max="24"
                step="2"
                value={config.numEncoderLayers}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Fewer layers = Faster inference, less RAM.</p>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Encoder Dimension
                <span className="text-blue-400">{config.encoderDim}</span>
              </label>
              <input
                type="range"
                name="encoderDim"
                min="64"
                max="384"
                step="32"
                value={config.encoderDim}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Lower dimension drastically reduces model size.</p>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Query Head Dimension
                <span className="text-blue-400">{config.queryHeadDim}</span>
              </label>
              <input
                type="range"
                name="queryHeadDim"
                min="16"
                max="64"
                step="4"
                value={config.queryHeadDim}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
             <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Batch Size (RTX 5060)
                <span className="text-blue-400">{config.batchSize}</span>
              </label>
              <input
                type="range"
                name="batchSize"
                min="4"
                max="64"
                step="4"
                value={config.batchSize}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-6">
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex-1">
                <h3 className="text-lg font-bold text-white mb-4">Resource Estimates</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <MemoryStick size={18} />
                            <span className="text-xs uppercase tracking-wider">Inference RAM (Int8)</span>
                        </div>
                        <div className={`text-2xl font-mono font-bold ${estimatedRam > 180 ? 'text-red-400' : 'text-green-400'}`}>
                            ~{estimatedRam} MB
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Limit: 200 MB</div>
                    </div>
                     <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Cpu size={18} />
                            <span className="text-xs uppercase tracking-wider">Atom Load</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-yellow-400">
                           Medium
                        </div>
                         <div className="text-xs text-slate-500 mt-1">Dual Core x86_64</div>
                    </div>
                </div>
                
                <div className="mt-6 bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                    <p className="text-sm text-blue-200">
                        <strong>Engineer's Note:</strong> The standard Zipformer is too large. We reduced <code>encoder-dim</code> to {config.encoderDim} and <code>layers</code> to {config.numEncoderLayers} to fit the strict 200MB limit after Int8 quantization.
                    </p>
                </div>
             </div>
        </div>
      </div>

      <CodeBlock code={trainCommand} language="bash" filename="run_training.sh" />
    </div>
  );
};