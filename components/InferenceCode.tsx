import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Terminal, FileCode } from 'lucide-react';

export const InferenceCode: React.FC = () => {
  const cmakeContent = `
cmake_minimum_required(VERSION 3.10)
project(EmbeddedASR)

set(CMAKE_CXX_STANDARD 17)

# Static linking for Busybox compatibility
set(CMAKE_EXE_LINKER_FLAGS "-static")

# Find NCNN (Assume installed in /usr/local or provide path)
find_package(ncnn REQUIRED)

# Find ALSA
find_package(ALSA REQUIRED)

add_executable(asr_main main.cpp)
target_link_libraries(asr_main ncnn ALSA::ALSA pthread)
`;

  const cppContent = `
#include <iostream>
#include <vector>
#include <string>
#include <alsa/asoundlib.h>
#include "net.h"

// Audio Config
#define SAMPLE_RATE 16000
#define CHANNELS 1
#define FRAMES_PER_BUFFER 1024

// Model Paths (Int8)
const char* ENCODER_PARAM = "encoder_int8.param";
const char* ENCODER_BIN   = "encoder_int8.bin";
// ... include decoder/joiner paths ...

// Simple Feature Extractor Stub (Real implementation needs Kaldi-compatible Fbank)
// For brevity, we assume a function 'compute_fbank' exists or use Sherpa's feature extractor.
std::vector<float> compute_fbank(const std::vector<short>& pcm_data);

int main() {
    // 1. Initialize NCNN
    ncnn::Net encoder, decoder, joiner;
    encoder.load_param(ENCODER_PARAM);
    encoder.load_model(ENCODER_BIN);
    // ... load others ...

    // 2. Setup ALSA Capture
    snd_pcm_t *handle;
    snd_pcm_hw_params_t *params;
    int rc;
    unsigned int val = SAMPLE_RATE;
    int dir;
    snd_pcm_uframes_t frames = 32;

    rc = snd_pcm_open(&handle, "default", SND_PCM_STREAM_CAPTURE, 0);
    if (rc < 0) {
        std::cerr << "Unable to open PCM device: " << snd_strerror(rc) << std::endl;
        return 1;
    }

    snd_pcm_hw_params_alloca(&params);
    snd_pcm_hw_params_any(handle, params);
    snd_pcm_hw_params_set_access(handle, params, SND_PCM_ACCESS_RW_INTERLEAVED);
    snd_pcm_hw_params_set_format(handle, params, SND_PCM_FORMAT_S16_LE);
    snd_pcm_hw_params_set_channels(handle, params, CHANNELS);
    snd_pcm_hw_params_set_rate_near(handle, params, &val, &dir);
    snd_pcm_hw_params(handle, params);

    // 3. Inference Loop
    std::vector<short> buffer(FRAMES_PER_BUFFER);
    
    // Initialize Model States (Zipformer States)
    // You must maintain these states between chunks!
    std::vector<ncnn::Mat> states; 
    // ... init zero states based on model dim ...

    std::cout << "Listening..." << std::endl;

    while (true) {
        rc = snd_pcm_readi(handle, buffer.data(), FRAMES_PER_BUFFER);
        if (rc == -EPIPE) {
            std::cerr << "Overrun occurred" << std::endl;
            snd_pcm_prepare(handle);
        } else if (rc < 0) {
            std::cerr << "Error from read: " << snd_strerror(rc) << std::endl;
        } else if (rc != (int)FRAMES_PER_BUFFER) {
            std::cerr << "Short read, read " << rc << " frames" << std::endl;
        }

        // A. Extract Features
        // std::vector<float> feats = compute_fbank(buffer);

        // B. Run Encoder (Streaming)
        ncnn::Extractor ex = encoder.create_extractor();
        ex.set_light_mode(true);
        ex.set_num_threads(2); // Atom has 2 cores

        // Feed inputs and states
        // ex.input("speech", feats_mat);
        // for(int i=0; i<states.size(); i++) ex.input(state_names[i], states[i]);

        // Get outputs and new states
        // ncnn::Mat encoder_out;
        // ex.extract("encoder_out", encoder_out);
        // for(int i=0; i<states.size(); i++) ex.extract(state_names_out[i], states[i]); // Update states

        // C. Greedy Search / Decoder
        // ... (Joiner logic here) ...
        
        // std::cout << "Detected: " << token << std::flush;
    }

    snd_pcm_drain(handle);
    snd_pcm_close(handle);
    return 0;
}
`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Terminal className="text-green-400" />
          Embedded C++ Inference
        </h2>
        <p className="text-slate-400 text-sm mb-4">
            The core logic for the Atom device. This uses <code>alsa-lib</code> for audio capture and <code>ncnn</code> for inference.
            <br/><span className="text-yellow-500">Note:</span> We use static linking to avoid missing shared libraries on Busybox.
        </p>
      </div>

      <div className="flex flex-col gap-2">
         <span className="text-slate-300 font-mono text-sm flex items-center gap-2"><FileCode size={16}/> main.cpp</span>
         <CodeBlock code={cppContent} language="cpp" filename="main.cpp" />
      </div>

      <div className="flex flex-col gap-2">
         <span className="text-slate-300 font-mono text-sm flex items-center gap-2"><FileCode size={16}/> CMakeLists.txt</span>
         <CodeBlock code={cmakeContent} language="cmake" filename="CMakeLists.txt" />
      </div>
    </div>
  );
};