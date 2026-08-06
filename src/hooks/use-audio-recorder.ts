import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav, peakLevel } from "@/lib/audio-wav";

/** Longest single clip we send to transcription before rolling over to a new one. */
const SEGMENT_SECONDS = 45;
/** A header-only WAV is ~44 bytes; anything this small has no usable audio. */
const MIN_BLOB_BYTES = 4000;

type Options = {
  /** Called with each complete WAV segment, in recording order. */
  onSegment: (blob: Blob) => void;
};

export function useAudioRecorder({ onSegment }: Options) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodesRef = useRef<{
    source: MediaStreamAudioSourceNode;
    processor: ScriptProcessorNode;
  } | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const framesRef = useRef(0);
  const producedRef = useRef(false);
  const segmentRef = useRef(onSegment);
  segmentRef.current = onSegment;

  const flush = useCallback(() => {
    const context = contextRef.current;
    const chunks = chunksRef.current;
    chunksRef.current = [];
    framesRef.current = 0;
    if (!context || chunks.length === 0) return;
    const blob = encodeWav(chunks, context.sampleRate);
    if (blob.size < MIN_BLOB_BYTES) return;
    producedRef.current = true;
    segmentRef.current(blob);
  }, []);

  const teardown = useCallback(() => {
    nodesRef.current?.processor.disconnect();
    nodesRef.current?.source.disconnect();
    nodesRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close().catch(() => {});
    contextRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (!contextRef.current) return;
    flush();
    teardown();
    setRecording(false);
    setLevel(0);
    setSeconds(0);
    if (!producedRef.current) {
      setError("That recording came through empty — check your mic and try again.");
    }
  }, [flush, teardown]);

  const start = useCallback(async () => {
    setError(null);
    producedRef.current = false;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("We couldn't reach your microphone. Allow access, then try again.");
      return;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextCtor();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      chunksRef.current.push(new Float32Array(input));
      framesRef.current += input.length;
      setLevel(peakLevel(input));
      setSeconds(Math.floor(framesRef.current / context.sampleRate));
      if (framesRef.current >= context.sampleRate * SEGMENT_SECONDS) flush();
    };

    source.connect(processor);
    processor.connect(context.destination);

    contextRef.current = context;
    streamRef.current = stream;
    nodesRef.current = { source, processor };
    chunksRef.current = [];
    framesRef.current = 0;
    setSeconds(0);
    setRecording(true);
  }, [flush]);

  useEffect(() => () => teardown(), [teardown]);

  return { recording, seconds, level, error, start, stop, clearError: () => setError(null) };
}
