import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Zap } from 'lucide-react';

export const DataPrep: React.FC = () => {
  const scriptContent = `
import logging
from pathlib import Path
import lhotse

def prepare_custom_dataset(wav_dir: str, transcript_dir: str, output_dir: str):
    logging.basicConfig(level=logging.INFO)
    wav_path = Path(wav_dir)
    trans_path = Path(transcript_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    logging.info("Scanning audio files...")
    # 1. Create Recordings
    # Assumes .wav files. Adjust extension if needed.
    recordings = lhotse.RecordingSet.from_dir(
        path=wav_path,
        pattern="*.wav",
        num_jobs=4
    )

    logging.info(f"Found {len(recordings)} recordings.")

    # 2. Create Supervisions
    # Assumes a simple text format: 'recording_id text content'
    supervisions = []
    # If transcripts are in a single file 'text', read it line by line
    text_file = trans_path / "text"
    if text_file.exists():
        with open(text_file, 'r', encoding='utf-8') as f:
            for line in f:
                parts = line.strip().split(maxsplit=1)
                if len(parts) < 2: continue
                rec_id, text = parts
                
                if rec_id in recordings:
                    rec = recordings[rec_id]
                    supervisions.append(
                        lhotse.SupervisionSegment(
                            id=rec_id,
                            recording_id=rec_id,
                            start=0.0,
                            duration=rec.duration,
                            channel=0,
                            text=text
                        )
                    )
    
    sups = lhotse.SupervisionSet.from_segments(supervisions)
    
    # 3. Create Cuts (Manifests)
    # Combine recordings and supervisions into cuts
    cuts = lhotse.CutSet.from_manifests(recordings=recordings, supervisions=sups)

    # 4. Compute Fbank Features
    logging.info("Computing Fbank features (80-dim)...")
    cuts = cuts.compute_and_store_features(
        extractor=lhotse.Fbank(lhotse.FbankConfig(num_mel_bins=80)),
        storage_path=out_path / "feats_train",
        num_jobs=4
    )

    # 5. Split Train/Valid (95/5 split)
    cuts_shuffled = cuts.shuffle(seed=42)
    split_idx = int(len(cuts_shuffled) * 0.95)
    cuts_train = cuts_shuffled[:split_idx]
    cuts_valid = cuts_shuffled[split_idx:]

    logging.info(f"Saving manifests to {out_path}...")
    cuts_train.to_file(out_path / "cuts_train.jsonl.gz")
    cuts_valid.to_file(out_path / "cuts_valid.jsonl.gz")
    
    logging.info("Data preparation complete.")

if __name__ == "__main__":
    # Adjust paths as needed
    prepare_custom_dataset(
        wav_dir="/data/wavs", 
        transcript_dir="/data/text", 
        output_dir="data/fbank"
    )
`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="text-yellow-400" />
          Step 1: Data Preparation
        </h2>
        <p className="text-slate-400 mb-4">
          Before training, we must format your raw audio and transcripts into Lhotse Cuts. 
          This script generates the <code>cuts_train.jsonl.gz</code> and <code>cuts_valid.jsonl.gz</code> files expected by Icefall.
        </p>
        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg mb-4">
          <h4 className="text-yellow-500 font-semibold text-sm mb-1">Prerequisites</h4>
          <ul className="list-disc list-inside text-sm text-yellow-200/80">
            <li>Raw wav files in <code>/data/wavs/*.wav</code></li>
            <li>Transcript file at <code>/data/text/text</code> (Format: <code>rec_id transcript</code>)</li>
            <li>Lhotse installed (<code>pip install lhotse</code>)</li>
          </ul>
        </div>
      </div>

      <CodeBlock code={scriptContent} language="python" filename="prepare_data.py" />
    </div>
  );
};