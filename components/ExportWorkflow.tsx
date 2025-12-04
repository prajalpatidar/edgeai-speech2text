import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Package, ArrowRight } from 'lucide-react';

export const ExportWorkflow: React.FC = () => {
  const exportScript = `
#!/bin/bash
# 1. Export Checkpoint to ONNX
# This uses the specific streaming export script from Icefall
python3 pruned_transducer_stateless7_streaming/export.py \\
  --exp-dir exp/tiny_zipformer \\
  --epoch 30 \\
  --avg 5 \\
  --onnx 1

echo "Exported to exp/tiny_zipformer/encoder.onnx, decoder.onnx, joiner.onnx"

# 2. Optimize and Convert to NCNN
# You need the 'onnx2ncnn' tool from the NCNN build
mkdir -p build/ncnn_models

# Convert Encoder
onnx2ncnn exp/tiny_zipformer/encoder.onnx build/ncnn_models/encoder.param build/ncnn_models/encoder.bin
# Convert Decoder
onnx2ncnn exp/tiny_zipformer/decoder.onnx build/ncnn_models/decoder.param build/ncnn_models/decoder.bin
# Convert Joiner
onnx2ncnn exp/tiny_zipformer/joiner.onnx build/ncnn_models/joiner.param build/ncnn_models/joiner.bin

# 3. Post-Training Quantization (Int8)
# This requires a calibration dataset, but for simplicity we often use the ncnn2int8 tool 
# with default tables or generated calibration tables.
# Assuming standard ncnn2table usage (simplified for brevity):

# (Optional) Generate calibration table
# ./ncnn2table --param build/ncnn_models/encoder.param --bin build/ncnn_models/encoder.bin ...

# Perform Quantization
ncnn2int8 build/ncnn_models/encoder.param build/ncnn_models/encoder.bin build/ncnn_models/encoder_int8.param build/ncnn_models/encoder_int8.bin
ncnn2int8 build/ncnn_models/decoder.param build/ncnn_models/decoder.bin build/ncnn_models/decoder_int8.param build/ncnn_models/decoder_int8.bin
ncnn2int8 build/ncnn_models/joiner.param build/ncnn_models/joiner.bin build/ncnn_models/joiner_int8.param build/ncnn_models/joiner_int8.bin

echo "Int8 Models ready in build/ncnn_models/*_int8.*"
`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Package className="text-purple-400" />
          Export & Quantization
        </h2>
        <div className="flex items-center gap-4 text-sm text-slate-400 my-4">
            <span className="bg-slate-900 px-3 py-1 rounded border border-slate-600">Icefall Checkpoint</span>
            <ArrowRight size={16} />
            <span className="bg-slate-900 px-3 py-1 rounded border border-slate-600">ONNX</span>
            <ArrowRight size={16} />
            <span className="bg-slate-900 px-3 py-1 rounded border border-slate-600">NCNN (FP32)</span>
            <ArrowRight size={16} />
            <span className="bg-slate-900 px-3 py-1 rounded border border-slate-600 text-green-400 font-bold">NCNN (Int8)</span>
        </div>
        <p className="text-slate-400 text-sm">
            We use <code>ncnn2int8</code> to squeeze the model into the 200MB limit. 
            Ensure you have built the <code>onnx2ncnn</code> and <code>ncnn2int8</code> tools from the ncnn source.
        </p>
      </div>

      <CodeBlock code={exportScript} language="bash" filename="export_model.sh" />
    </div>
  );
};