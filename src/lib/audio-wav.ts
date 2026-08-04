const TARGET_SAMPLE_RATE = 16000;

function mergeChunks(chunks: Float32Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function downsample(samples: Float32Array, inputRate: number) {
  if (inputRate <= TARGET_SAMPLE_RATE) return samples;
  const ratio = inputRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.floor(samples.length / ratio);
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j += 1) {
      sum += samples[j]!;
      count += 1;
    }
    output[i] = count ? sum / count : 0;
  }
  return output;
}

/** Encodes raw mono PCM chunks into a complete 16 kHz 16-bit WAV file. */
export function encodeWav(chunks: Float32Array[], inputRate: number): Blob {
  const samples = downsample(mergeChunks(chunks), inputRate);
  const rate = inputRate <= TARGET_SAMPLE_RATE ? inputRate : TARGET_SAMPLE_RATE;
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function peakLevel(chunk: Float32Array) {
  let peak = 0;
  for (let i = 0; i < chunk.length; i += 1) {
    const value = Math.abs(chunk[i]!);
    if (value > peak) peak = value;
  }
  return peak;
}
