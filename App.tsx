import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

// Declaration for lamejs library loaded from CDN
declare const lamejs: any;

// Declaration for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.789-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.026.977-2.19.977-3.434 0-3.192-2.163-5.878-5.168-6.694V4.5a1.5 1.5 0 00-3 0v.151c-1.28.32-2.43.9-3.44 1.715M10 18h4" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L15 6m-2 14l-2.293-2.293a1 1 0 010-1.414L13 18m7-5l-2.293-2.293a1 1 0 00-1.414 0L15 12m2.293 2.293a1 1 0 001.414 0L21 12m-9-9h.01M15 3h.01M9 17h.01" />
    </svg>
);

const GuitarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-12v10c0 1.105-1.343 2-3 2s-3-.895-3-2V4l3-1 3 1z" />
    </svg>
);

const HeadphonesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 14.5A3.5 3.5 0 0112 18a3.5 3.5 0 01-3.5-3.5V11a3.5 3.5 0 017 0v3.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 11a6 6 0 11-12 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 11V9a2 2 0 00-2-2h-1a2 2 0 00-2 2v2m-6 0V9a2 2 0 012-2h1a2 2 0 012 2v2" />
    </svg>
);

const NoiseReductionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6M12 7v10M15 9v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15a1 1 0 001.05-1.623A3.987 3.987 0 018 11.95a3.987 3.987 0 011.05-2.623A1 1 0 008 8H7a1 1 0 00-1 1v6zM18 15a1 1 0 01-1.05-1.623A3.987 3.987 0 0016 11.95a3.987 3.987 0 00-1.05-2.623A1 1 0 0116 8h1a1 1 0 011 1v6z" />
  </svg>
);

const RadioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ArenaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const YouTubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
  </svg>
);


type EffectType = 'warm' | 'pop' | 'ballad' | 'radio' | 'ethereal' | 'robot' | 'telephone' | 'arena';

interface Recording {
  id: number;
  blob: Blob;
  url: string;
  name: string;
  isMastered?: boolean;
  hasGuitar?: boolean;
  applyingFX?: EffectType;
  isMastering?: boolean;
  isAddingGuitar?: boolean;
  isConvertingToMp3?: boolean;
  isConvertingToMp4?: boolean;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [topic, setTopic] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [vocalGuideUrl, setVocalGuideUrl] = useState('');
  const [isGeneratingVocalGuide, setIsGeneratingVocalGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noiseReductionEnabled, setNoiseReductionEnabled] = useState(true);
  const [liveMonitoringEnabled, setLiveMonitoringEnabled] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showShare = 'share' in navigator && 'canShare' in navigator;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const getAudioContext = () => new (window.AudioContext || (window as any).webkitAudioContext)();

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        // API Ready
      };
    }
  }, []);

  // Extract Video ID and Load Player
  useEffect(() => {
    const getID = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const id = getID(youtubeUrl);
    setVideoId(id);
  }, [youtubeUrl]);

  useEffect(() => {
    if (videoId && window.YT && window.YT.Player) {
       // Small timeout to ensure container is rendered
       setTimeout(() => {
           if (playerRef.current) {
               // If player exists, load new video
               if(playerRef.current.loadVideoById) {
                   playerRef.current.loadVideoById(videoId);
               }
           } else {
               // Create new player
               try {
                 playerRef.current = new window.YT.Player('youtube-player', {
                    height: '200',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'playsinline': 1,
                        'controls': 1,
                        'rel': 0
                    },
                });
               } catch(e) {
                   console.error("Error initializing YT player", e);
               }
           }
       }, 100);
    } else if (!videoId && playerRef.current) {
        // destroy player if link is cleared
        playerRef.current.destroy();
        playerRef.current = null;
    }
  }, [videoId]);


  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let streamToRecord = stream;

        if (noiseReductionEnabled || liveMonitoringEnabled) {
            const audioContext = getAudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            let processingChainEnd: AudioNode = source;
            
            if (noiseReductionEnabled) {
                const highpass = audioContext.createBiquadFilter();
                highpass.type = 'highpass';
                highpass.frequency.setValueAtTime(80, audioContext.currentTime);

                const compressor = audioContext.createDynamicsCompressor();
                compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
                compressor.knee.setValueAtTime(30, audioContext.currentTime);
                compressor.ratio.setValueAtTime(4, audioContext.currentTime);
                compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
                compressor.release.setValueAtTime(0.25, audioContext.currentTime);
                
                processingChainEnd.connect(highpass);
                highpass.connect(compressor);
                processingChainEnd = compressor;
                
                const destination = audioContext.createMediaStreamDestination();
                processingChainEnd.connect(destination);
                streamToRecord = destination.stream;
            }

            if (liveMonitoringEnabled) {
                processingChainEnd.connect(audioContext.destination);
            }
        }
        
        mediaRecorderRef.current = new MediaRecorder(streamToRecord);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            saveRecording(audioBlob);
            stream.getTracks().forEach(track => track.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            
            // Pause YouTube when recording stops
            if (playerRef.current && playerRef.current.pauseVideo) {
                playerRef.current.pauseVideo();
            }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerIntervalRef.current = setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
        }, 1000);
        
        // Auto-play YouTube from start when recording starts
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.seekTo(0);
            playerRef.current.playVideo();
        }

    } catch (err) {
        console.error("Error starting recording:", err);
        setError("Could not start recording. Please ensure microphone permissions are granted.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };
  
  const saveRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newRecording: Recording = {
      id: Date.now(),
      blob,
      url,
      name: `Recording ${recordings.length + 1}`,
    };
    setRecordings(prev => [newRecording, ...prev]);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateLyrics = async () => {
    if (!topic) {
      setError("Please enter a topic for the lyrics.");
      return;
    }
    setIsGeneratingLyrics(true);
    setError(null);
    setLyrics('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short song (2 verses, 1 chorus) about "${topic}". The lyrics should be simple and easy to sing.`,
      });
      setLyrics(response.text);
    } catch (err) {
      console.error("Error generating lyrics:", err);
      setError("Failed to generate lyrics. Please try again.");
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const generateVocalGuide = async () => {
        if (!lyrics) {
            setError("Please generate lyrics first.");
            return;
        }
        setIsGeneratingVocalGuide(true);
        setError(null);
        setVocalGuideUrl('');
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Read these lyrics clearly and slowly, as a guide for a singer: ${lyrics}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
                const url = URL.createObjectURL(audioBlob);
                setVocalGuideUrl(url);
            } else {
                throw new Error("No audio data returned from API.");
            }
        } catch (err) {
            console.error("Error generating vocal guide:", err);
            setError("Failed to generate vocal guide. Please try again.");
        } finally {
            setIsGeneratingVocalGuide(false);
        }
    };
  
  const updateRecording = useCallback((id: number, updates: Partial<Recording>) => {
    setRecordings(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, ...updates } : rec))
    );
  }, []);
  
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length of fmt data
    setUint16(1); // PCM - integer samples
    setUint16(numOfChan); // two channels
    setUint32(buffer.sampleRate); // sample rate
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const handleImportAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = getAudioContext();
        // Decode audio data (accepts mp3, wav, ogg, etc)
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Convert to WAV Blob for consistent internal handling
        const wavBlob = audioBufferToWav(audioBuffer);
        const url = URL.createObjectURL(wavBlob);
        
        const newRecording: Recording = {
            id: Date.now(),
            blob: wavBlob,
            url,
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        };
        setRecordings(prev => [newRecording, ...prev]);
    } catch (err) {
        console.error("Error importing file:", err);
        setError("Failed to import audio. The format might not be supported or the file is corrupted.");
    } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };
  
  const applyProSingerFX = useCallback(async (id: number, blob: Blob, presetKey: EffectType) => {
    updateRecording(id, { applyingFX: presetKey });

    try {
        const audioContext = getAudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const offlineCtx = new OfflineAudioContext(decodedBuffer.numberOfChannels, decodedBuffer.length, decodedBuffer.sampleRate);

        const source = offlineCtx.createBufferSource();
        source.buffer = decodedBuffer;

        let currentOutput: AudioNode = source;

        if (presetKey === 'radio') {
             // Radio Effect: Bandpass + Distortion
             const bandpass = offlineCtx.createBiquadFilter();
             bandpass.type = 'bandpass';
             bandpass.frequency.value = 2000;
             bandpass.Q.value = 1;

             const distortion = offlineCtx.createWaveShaper();
             const makeDistortionCurve = (amount: number) => {
                const k = typeof amount === 'number' ? amount : 50;
                const n_samples = 44100;
                const curve = new Float32Array(n_samples);
                const deg = Math.PI / 180;
                for (let i = 0; i < n_samples; ++i ) {
                  const x = i * 2 / n_samples - 1;
                  curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
                }
                return curve;
             };
             distortion.curve = makeDistortionCurve(200);
             distortion.oversample = '4x';

             const compressor = offlineCtx.createDynamicsCompressor();
             compressor.threshold.value = -10;
             compressor.ratio.value = 12;

             source.connect(bandpass);
             bandpass.connect(distortion);
             distortion.connect(compressor);
             compressor.connect(offlineCtx.destination);

        } else if (presetKey === 'telephone') {
            // Telephone: Narrow Bandpass + Compression
            const highpass = offlineCtx.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 500;
            
            const lowpass = offlineCtx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 3000;

            const compressor = offlineCtx.createDynamicsCompressor();
            compressor.threshold.value = -15;
            compressor.ratio.value = 8;
            
            source.connect(highpass);
            highpass.connect(lowpass);
            lowpass.connect(compressor);
            compressor.connect(offlineCtx.destination);

        } else if (presetKey === 'robot') {
            // Robot Effect: Ring Modulation
            const oscillator = offlineCtx.createOscillator();
            oscillator.frequency.value = 50; // Carrier frequency
            oscillator.type = 'sine';
            
            const gainNode = offlineCtx.createGain();
            gainNode.gain.value = 0.0; // Controlled by oscillator
            
            const carrierGain = offlineCtx.createGain();
            carrierGain.gain.value = 1.0; 
            oscillator.connect(carrierGain);
            
            const dry = offlineCtx.createGain();
            dry.gain.value = 0.2;
            
            const amGain = offlineCtx.createGain();
            amGain.gain.value = 0; // modulated
            
            oscillator.connect(amGain.gain);
            source.connect(amGain);
            source.connect(dry);
            
            amGain.connect(offlineCtx.destination);
            dry.connect(offlineCtx.destination);
            oscillator.start(0);
            
        } else {
            // Standard Singing Effects
            const presets: Record<string, any> = {
                warm: {
                    highpassFreq: 60, lowMidBoostFreq: 350, lowMidBoostGain: 1.5,
                    compThreshold: -18, compRatio: 4,
                    reverbWet: 0.15, reverbDecay: 1.2, doublerGain: 0.15,
                },
                pop: {
                    highpassFreq: 100, presenceBoostFreq: 5000, presenceBoostGain: 2.5,
                    airBoostFreq: 12000, airBoostGain: 2, compThreshold: -24, compRatio: 10,
                    reverbWet: 0.15, reverbDecay: 0.8, doublerGain: 0.4,
                },
                ballad: {
                    highpassFreq: 80, midScoopFreq: 1000, midScoopGain: -1.0,
                    compThreshold: -15, compRatio: 3,
                    reverbWet: 0.35, reverbDecay: 3.0, doublerGain: 0.1,
                },
                ethereal: {
                     highpassFreq: 150, airBoostFreq: 10000, airBoostGain: 5,
                     compThreshold: -20, compRatio: 4,
                     reverbWet: 0.6, reverbDecay: 6.0, doublerGain: 0.3, preDelay: 0.1
                },
                arena: {
                    highpassFreq: 120, presenceBoostFreq: 3000, presenceBoostGain: 3,
                    compThreshold: -16, compRatio: 5,
                    reverbWet: 0.5, reverbDecay: 4.0, doublerGain: 0.2, preDelay: 0.05
                }
            };

            const preset = presets[presetKey];

            // --- EQ Chain ---
            const highpass = offlineCtx.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = preset.highpassFreq;
            let lastEQNode: AudioNode = highpass;

            if (preset.lowMidBoostFreq) {
                const lowMid = offlineCtx.createBiquadFilter();
                lowMid.type = 'peaking';
                lowMid.frequency.value = preset.lowMidBoostFreq;
                lowMid.gain.value = preset.lowMidBoostGain;
                lastEQNode.connect(lowMid);
                lastEQNode = lowMid;
            }
            if (preset.presenceBoostFreq) {
                const presence = offlineCtx.createBiquadFilter();
                presence.type = 'peaking';
                presence.frequency.value = preset.presenceBoostFreq;
                presence.gain.value = preset.presenceBoostGain;
                lastEQNode.connect(presence);
                lastEQNode = presence;
            }
            if (preset.airBoostFreq) {
                const air = offlineCtx.createBiquadFilter();
                air.type = 'highshelf';
                air.frequency.value = preset.airBoostFreq;
                air.gain.value = preset.airBoostGain;
                lastEQNode.connect(air);
                lastEQNode = air;
            }
            if (preset.midScoopFreq) {
                const scoop = offlineCtx.createBiquadFilter();
                scoop.type = 'peaking';
                scoop.frequency.value = preset.midScoopFreq;
                scoop.gain.value = preset.midScoopGain;
                lastEQNode.connect(scoop);
                lastEQNode = scoop;
            }

            // --- Compressor ---
            const compressor = offlineCtx.createDynamicsCompressor();
            compressor.threshold.value = preset.compThreshold;
            compressor.knee.value = 30;
            compressor.ratio.value = preset.compRatio;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;

            // --- Effects ---
            const delay1 = offlineCtx.createDelay(); delay1.delayTime.value = 0.015 + (preset.preDelay || 0);
            const delay2 = offlineCtx.createDelay(); delay2.delayTime.value = 0.025 + (preset.preDelay || 0);
            const pan1 = offlineCtx.createStereoPanner(); pan1.pan.value = -0.5;
            const pan2 = offlineCtx.createStereoPanner(); pan2.pan.value = 0.5;
            const doublerGain = offlineCtx.createGain(); doublerGain.gain.value = preset.doublerGain;
            
            const convolver = offlineCtx.createConvolver();
            // Create impulse response for reverb
            const impulseLen = offlineCtx.sampleRate * preset.reverbDecay;
            const impulse = offlineCtx.createBuffer(2, impulseLen, offlineCtx.sampleRate);
            for (let i = 0; i < 2; i++) {
                const channel = impulse.getChannelData(i);
                for (let j = 0; j < impulseLen; j++) {
                    channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / impulseLen, 2.5);
                }
            }
            convolver.buffer = impulse;
            
            const wetGain = offlineCtx.createGain(); wetGain.gain.value = preset.reverbWet;
            const dryGain = offlineCtx.createGain(); dryGain.gain.value = 1.0;

            // --- Routing ---
            source.connect(highpass);
            lastEQNode.connect(compressor);
            
            // Dry
            compressor.connect(dryGain);
            dryGain.connect(offlineCtx.destination);
            
            // Doubler (Wide stereo effect)
            compressor.connect(delay1).connect(pan1).connect(doublerGain);
            compressor.connect(delay2).connect(pan2).connect(doublerGain);
            doublerGain.connect(offlineCtx.destination);
            
            // Reverb
            compressor.connect(convolver).connect(wetGain).connect(offlineCtx.destination);
        }
        
        source.start(0);
        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        
        setRecordings(prev => prev.map(rec => {
            if (rec.id !== id) return rec;
            const baseName = rec.name.replace(/ \((Warm Vocal|Bright Pop|Rich Ballad|Radio|Ethereal|Robot|Telephone|Arena|Pro FX|\+ Guitar|Mastered)\)/g, '');
            const effectName = { warm: 'Warm Vocal', pop: 'Bright Pop', ballad: 'Rich Ballad', radio: 'Radio', ethereal: 'Ethereal', robot: 'Robot', telephone: 'Telephone', arena: 'Arena' }[presetKey];
            const newName = `${baseName} (${effectName})`;
            return { ...rec, blob: wavBlob, url, name: newName };
        }));
    } catch (err) {
        console.error("Error applying FX:", err);
        setError("Failed to apply vocal effects.");
    } finally {
        updateRecording(id, { applyingFX: undefined });
    }
  }, [updateRecording]);

  const applyMastering = useCallback(async (id: number, blob: Blob) => {
    updateRecording(id, { isMastering: true });
    try {
        const audioContext = getAudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const offlineCtx = new OfflineAudioContext(decodedBuffer.numberOfChannels, decodedBuffer.length, decodedBuffer.sampleRate);

        const source = offlineCtx.createBufferSource();
        source.buffer = decodedBuffer;

        const highpass = offlineCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 30;

        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 20;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.05;
        compressor.release.value = 0.1;

        const eq = offlineCtx.createBiquadFilter();
        eq.type = 'highshelf';
        eq.frequency.value = 12000;
        eq.gain.value = 1.5;

        const delay = offlineCtx.createDelay(0.5);
        delay.delayTime.value = 0.1;
        const feedback = offlineCtx.createGain();
        feedback.gain.value = 0.15;
        const delayWet = offlineCtx.createGain();
        delayWet.gain.value = 0.1;
        
        source.connect(highpass);
        highpass.connect(compressor);
        compressor.connect(eq);

        eq.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        
        eq.connect(offlineCtx.destination);
        delay.connect(delayWet);
        delayWet.connect(offlineCtx.destination);
        
        source.start(0);
        const renderedBuffer = await offlineCtx.startRendering();

        const wavBlob = audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        setRecordings(prev => prev.map(rec => {
            if (rec.id !== id) return rec;
            const baseName = rec.name.replace(/ \((Warm Vocal|Bright Pop|Rich Ballad|Radio|Ethereal|Robot|Telephone|Arena|Pro FX|\+ Guitar|Mastered)\)/g, '');
            const newName = `${baseName} (Mastered)`;
            return { ...rec, blob: wavBlob, url, isMastered: true, name: newName };
        }));
    } catch (err) {
        console.error("Error applying mastering:", err);
        setError("Failed to apply mastering.");
    } finally {
        updateRecording(id, { isMastering: false });
    }
  }, [updateRecording]);
  
  // Detect when the singing actually starts to sync the guitar
  const detectOnset = (buffer: AudioBuffer, threshold = 0.02) => {
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) {
      if (Math.abs(channel[i]) > threshold) {
        return i / buffer.sampleRate;
      }
    }
    return 0;
  };

  const addGuitar = useCallback(async (id: number, blob: Blob) => {
    updateRecording(id, { isAddingGuitar: true });
    try {
        const audioContext = getAudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            throw new Error("Invalid audio data");
        }
        const vocalBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const duration = vocalBuffer.duration;
        const offlineCtx = new OfflineAudioContext(2, audioContext.sampleRate * duration, audioContext.sampleRate);
        
        // --- 1. Add Vocals ---
        const vocalSource = offlineCtx.createBufferSource();
        vocalSource.buffer = vocalBuffer;
        const vocalGain = offlineCtx.createGain();
        vocalGain.gain.value = 0.85; 
        vocalSource.connect(vocalGain);
        vocalGain.connect(offlineCtx.destination);

        // --- 2. Guitar Setup ---
        const guitarBus = offlineCtx.createGain();
        guitarBus.gain.value = 0.6; // Overall guitar level
        
        // Create a "Body Resonance" to make it sound more like a wooden box
        const bodyFilter = offlineCtx.createBiquadFilter();
        bodyFilter.type = 'peaking';
        bodyFilter.frequency.value = 240; // Resonant freq of guitar body
        bodyFilter.Q.value = 1.5;
        bodyFilter.gain.value = 4;
        
        // Add Reverb to guitar track so it isn't dry
        const guitarConvolver = offlineCtx.createConvolver();
        const revLen = offlineCtx.sampleRate * 1.5;
        const revBuf = offlineCtx.createBuffer(2, revLen, offlineCtx.sampleRate);
        for(let i=0; i<2; i++) {
            const ch = revBuf.getChannelData(i);
            for(let j=0; j<revLen; j++) ch[j] = (Math.random()*2-1) * Math.pow(1-j/revLen, 2);
        }
        guitarConvolver.buffer = revBuf;
        const guitarRevGain = offlineCtx.createGain();
        guitarRevGain.gain.value = 0.2;

        guitarBus.connect(bodyFilter);
        bodyFilter.connect(offlineCtx.destination);
        bodyFilter.connect(guitarConvolver);
        guitarConvolver.connect(guitarRevGain);
        guitarRevGain.connect(offlineCtx.destination);

        // --- 3. Sequencing ---
        const startTime = detectOnset(vocalBuffer);
        // Simple Chords: Am - G - C - F
        const chords = [[0, 3, 7], [-2, 2, 5], [-9, -5, -2], [-4, 0, 3]];
        const tempo = 100;
        const beatsPerChord = 4;
        const beatDuration = 60 / tempo;
        const strumInterval = 0.035; 

        let currentTime = startTime; // Start exactly when singing starts
        let chordIndex = 0;

        while (currentTime < duration) {
            const chord = chords[chordIndex % chords.length];
            
            // Strum Chord
            for (let i = 0; i < 3; i++) {
                 if (currentTime > duration) break;
                 
                 const note = chord[i];
                 const freq = 220 * Math.pow(2, note / 12); 
                 
                 const osc = offlineCtx.createOscillator();
                 osc.type = 'sawtooth'; // Sawtooth is richer than sine/triangle
                 osc.frequency.setValueAtTime(freq, currentTime + (i * strumInterval));
                 
                 // Filter Envelope (The "Pluck")
                 const filter = offlineCtx.createBiquadFilter();
                 filter.type = 'lowpass';
                 filter.Q.value = 0.5;
                 filter.frequency.setValueAtTime(2500, currentTime + (i * strumInterval));
                 filter.frequency.exponentialRampToValueAtTime(300, currentTime + (i * strumInterval) + 0.25); 

                 // Amplitude Envelope
                 const env = offlineCtx.createGain();
                 env.gain.setValueAtTime(0, currentTime + (i * strumInterval));
                 env.gain.linearRampToValueAtTime(0.8, currentTime + (i * strumInterval) + 0.01); // Fast attack
                 env.gain.exponentialRampToValueAtTime(0.01, currentTime + (i * strumInterval) + 1.5); // Decay

                 osc.connect(filter);
                 filter.connect(env);
                 env.connect(guitarBus);
                 
                 osc.start(currentTime + (i * strumInterval));
                 osc.stop(currentTime + (i * strumInterval) + 2.0);
            }

            // Arpeggiator (Finger picking style between strums)
            const arpeggioPoints = [1.5, 2.0, 2.5, 3.0, 3.5];
            arpeggioPoints.forEach(beatOffset => {
                 const time = currentTime + beatOffset * beatDuration;
                 if (time > duration) return;
                 
                 const noteIdx = Math.floor(Math.random() * 3); // Pick one string
                 const note = chord[noteIdx] + (Math.random() > 0.5 ? 0 : 12); // Sometimes octave up
                 const freq = 220 * Math.pow(2, note / 12);

                 const osc = offlineCtx.createOscillator();
                 osc.type = 'sawtooth';
                 osc.frequency.setValueAtTime(freq, time);
                 
                 const filter = offlineCtx.createBiquadFilter();
                 filter.type = 'lowpass';
                 filter.Q.value = 0.5;
                 filter.frequency.setValueAtTime(2000, time);
                 filter.frequency.exponentialRampToValueAtTime(200, time + 0.15); 

                 const env = offlineCtx.createGain();
                 env.gain.setValueAtTime(0, time);
                 env.gain.linearRampToValueAtTime(0.5, time + 0.01);
                 env.gain.exponentialRampToValueAtTime(0.01, time + 0.8); 

                 osc.connect(filter);
                 filter.connect(env);
                 env.connect(guitarBus);
                 
                 osc.start(time);
                 osc.stop(time + 1.0);
            });

            currentTime += beatsPerChord * beatDuration;
            chordIndex++;
        }
        
        vocalSource.start(0);
        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);
        
        setRecordings(prevRecordings => prevRecordings.map(rec => {
            if (rec.id === id) {
                const baseName = rec.name.replace(/ \((Warm Vocal|Bright Pop|Rich Ballad|Radio|Ethereal|Robot|Telephone|Arena|Pro FX|\+ Guitar|Mastered)\)/g, '');
                const newName = `${baseName} (+ Guitar)`;
                return { ...rec, blob: wavBlob, url, hasGuitar: true, name: newName };
            }
            return rec;
        }));
    } catch (err) {
        console.error("Error adding guitar:", err);
        setError("Failed to add guitar accompaniment. Try refreshing the page if the issue persists.");
    } finally {
        updateRecording(id, { isAddingGuitar: false });
    }
  }, [updateRecording]);

  const handleDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name.replace(/ /g, '_')}.wav`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };
  
  const convertBlobToMp3 = async (blob: Blob) => {
    const audioContext = getAudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const mp3encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const samples = audioBuffer.getChannelData(0);
    const sampleBlockSize = 1152;
    const mp3Data = [];

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const int16 = new Int16Array(sampleChunk.length);
      for (let j = 0; j < sampleChunk.length; j++) {
        int16[j] = sampleChunk[j] * 32767;
      }
      const mp3buf = mp3encoder.encodeBuffer(int16);
      if (mp3buf.length > 0) {
        mp3Data.push(new Blob([mp3buf]));
      }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(new Blob([mp3buf]));
    }
    return new Blob(mp3Data, { type: 'audio/mp3' });
  };
  
  const handleDownloadMp3 = async (id: number, blob: Blob, name: string) => {
    updateRecording(id, { isConvertingToMp3: true });
    try {
        const mp3Blob = await convertBlobToMp3(blob);
        const url = URL.createObjectURL(mp3Blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${name.replace(/ /g, '_')}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        console.error("Error converting to MP3:", err);
        setError("Failed to convert to MP3.");
    } finally {
        updateRecording(id, { isConvertingToMp3: false });
    }
  };

    const handleDownloadMp4 = async (id: number, blob: Blob, name: string) => {
        updateRecording(id, { isConvertingToMp4: true });
        try {
            const CANVAS_WIDTH = 640;
            const CANVAS_HEIGHT = 360;
            const canvas = document.createElement('canvas');
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            const audioContext = getAudioContext();
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const destination = audioContext.createMediaStreamDestination();
            source.connect(analyser);
            source.connect(destination);
            
            const videoStream = canvas.captureStream(30);
            const audioStream = destination.stream;
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);

            const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
            const fileExtension = mimeType.split('/')[1];
            const recorder = new MediaRecorder(combinedStream, { mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const videoBlob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(videoBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${name.replace(/ /g, '_')}.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                audioContext.close();
            };

            recorder.start();
            source.start(0);
            
            const draw = () => {
                if (recorder.state !== 'recording') return;

                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.fillStyle = 'rgb(15 23 42)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                const barWidth = (CANVAS_WIDTH / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = dataArray[i];
                    const r = barHeight + (25 * (i/bufferLength));
                    const g = 250 * (i/bufferLength);
                    const b = 50;
                    ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${b})`;
                    ctx.fillRect(x, CANVAS_HEIGHT - barHeight / 2, barWidth, barHeight / 2);
                    x += barWidth + 1;
                }
            };
            draw();

            source.onended = () => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            };
        } catch (err) {
            console.error("Error converting to video:", err);
            setError("Failed to create video file. Your browser might not support the required APIs.");
        } finally {
            updateRecording(id, { isConvertingToMp4: false });
        }
    };


  const handleShare = async (blob: Blob, name: string) => {
    const fileExtension = blob.type.split('/')[1].split(';')[0];
    const fileName = `${name.replace(/ /g, '_')}.${fileExtension === 'webm' ? 'webm' : 'wav'}`;
    const file = new File([blob], fileName, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: 'My AI Song Recording',
                text: `Check out my recording: ${name}`,
                files: [file],
            });
        } catch (error) {
            console.error('Error sharing:', error);
            setError("Could not share the file.");
        }
    } else {
        setError("Sharing not supported on this browser.");
    }
  };

  const handleDelete = (id: number) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
  };
  
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">AI Song Recorder</h1>
          <p className="text-slate-400 mt-2">Record your voice, get AI lyrics, and produce your next hit.</p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 G 0 1 1.698z"/></svg>
            </span>
          </div>
        )}

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Recording and Lyrics */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col items-center space-y-6">
            
            <div className="w-full space-y-4">
                <h2 className="text-xl font-semibold text-slate-300 flex items-center">
                    <YouTubeIcon />
                    Karaoke / Backing Track
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Paste YouTube Link here (e.g., Karaoke track)..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                     {youtubeUrl && <button onClick={() => setYoutubeUrl('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-200">&times;</button>}
                </div>
                {videoId ? (
                     <div className="rounded-md overflow-hidden border border-slate-700 bg-black">
                        <div id="youtube-player"></div>
                        <p className="text-xs text-slate-400 p-2 text-center bg-slate-800">
                            Note: Video will auto-play when you hit Record. Audio is for monitoring only and won't be in the download.
                        </p>
                    </div>
                ) : (
                    <div className="text-xs text-slate-500 italic px-2">
                        Paste a link to sing along. The video will sync with the record button.
                    </div>
                )}
            </div>

            <div className="w-full border-t border-slate-700 my-2"></div>

            <h2 className="text-2xl font-semibold text-slate-300 self-start">1. Record Your Vocals</h2>
            <div className="flex flex-col items-center space-y-4 w-full">
                <div className="flex items-center justify-center space-x-6 w-full">
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 hover:scale-105'}`}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                    </button>
                    <div className="text-5xl font-mono bg-slate-900 px-6 py-3 rounded-lg border border-slate-700 shadow-inner text-purple-400 tracking-wider">
                        {formatTime(recordingSeconds)}
                    </div>
                </div>
                <div className="w-full flex justify-center space-x-6 pt-4">
                    <label htmlFor="noise-reduction" className="flex flex-col items-center cursor-pointer group">
                        <div className="relative mb-2">
                            <input
                                id="noise-reduction"
                                type="checkbox"
                                className="sr-only"
                                checked={noiseReductionEnabled}
                                onChange={() => setNoiseReductionEnabled(prev => !prev)}
                                disabled={isRecording}
                            />
                            <div className={`block w-12 h-7 rounded-full transition-colors ${!isRecording ? (noiseReductionEnabled ? 'bg-purple-600' : 'bg-slate-600') : 'bg-slate-700 cursor-not-allowed'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${noiseReductionEnabled ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <span className={`text-xs font-medium transition-colors flex items-center ${noiseReductionEnabled ? 'text-purple-300' : 'text-slate-500'}`}>
                             <NoiseReductionIcon />
                             <span className="ml-1">Clean Audio</span>
                        </span>
                    </label>
                    
                    <label htmlFor="live-monitoring" className="flex flex-col items-center cursor-pointer group">
                         <div className="relative mb-2">
                                <input
                                    id="live-monitoring"
                                    type="checkbox"
                                    className="sr-only"
                                    checked={liveMonitoringEnabled}
                                    onChange={() => setLiveMonitoringEnabled(prev => !prev)}
                                    disabled={isRecording}
                                />
                                <div className={`block w-12 h-7 rounded-full transition-colors ${!isRecording ? (liveMonitoringEnabled ? 'bg-purple-600' : 'bg-slate-600') : 'bg-slate-700 cursor-not-allowed'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${liveMonitoringEnabled ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <span className={`text-xs font-medium transition-colors flex items-center ${liveMonitoringEnabled ? 'text-purple-300' : 'text-slate-500'}`}>
                            <HeadphonesIcon />
                            <span className="ml-1">Headphones</span>
                        </span>
                    </label>
                </div>
            </div>

            <div className="w-full space-y-4 border-t border-slate-700 pt-6">
               <h2 className="text-xl font-semibold text-slate-300">2. Generate Lyrics (Optional)</h2>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic, e.g., 'summer rain'"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isGeneratingLyrics}
                />
                <button
                    onClick={generateLyrics}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
                    disabled={isGeneratingLyrics}
                >
                    {isGeneratingLyrics ? 'Generating...' : 'Generate Lyrics'}
                </button>
                {lyrics && (
                    <div className="mt-4 p-4 bg-slate-900/70 rounded-md max-h-48 overflow-y-auto border border-slate-700">
                        <h3 className="font-semibold mb-2 text-pink-400">Generated Lyrics:</h3>
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{lyrics}</pre>
                    </div>
                )}
            </div>
             <div className="w-full space-y-4">
                <button
                    onClick={generateVocalGuide}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
                    disabled={!lyrics || isGeneratingVocalGuide}
                >
                    {isGeneratingVocalGuide ? 'Generating Guide...' : 'Generate Vocal Guide'}
                </button>
                {vocalGuideUrl && (
                     <div className="mt-2 p-3 bg-slate-900/70 rounded-md flex flex-col space-y-2 border border-slate-700">
                        <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Vocal Guide</span>
                        <audio controls src={vocalGuideUrl} className="w-full h-8"></audio>
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Recordings */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-300">My Recordings</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex items-center bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium py-2 px-3 rounded transition-colors disabled:opacity-50 border border-slate-600"
                    >
                        {isImporting ? 'Importing...' : <><UploadIcon /> Import Audio</>}
                    </button>
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="audio/*" 
                onChange={handleImportAudio} 
            />
             {recordings.length > 0 ? (
                <ul className="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                    {recordings.map(rec => (
                        <li key={rec.id} className="bg-slate-900/80 p-4 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-slate-200">{rec.name}</span>
                                <button onClick={() => handleDelete(rec.id)} className="text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete recording">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <audio controls src={rec.url} className="w-full mb-4 h-10"></audio>
                             <div className="border-t border-slate-700 pt-3 mb-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">FX Studio</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'warm')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <MagicWandIcon/> <span className="text-[10px] mt-1">Warm</span>
                                    </button>
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'pop')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <MagicWandIcon/> <span className="text-[10px] mt-1">Pop</span>
                                    </button>
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'ballad')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <MagicWandIcon/> <span className="text-[10px] mt-1">Ballad</span>
                                    </button>
                                     <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'radio')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <RadioIcon/> <span className="text-[10px] mt-1">Radio</span>
                                    </button>
                                     <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'ethereal')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <SparklesIcon/> <span className="text-[10px] mt-1">Ether</span>
                                    </button>
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'robot')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <RobotIcon/> <span className="text-[10px] mt-1">Robot</span>
                                    </button>
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'telephone')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <PhoneIcon/> <span className="text-[10px] mt-1">Phone</span>
                                    </button>
                                    <button onClick={() => applyProSingerFX(rec.id, rec.blob, 'arena')} disabled={!!rec.applyingFX} className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50">
                                        <ArenaIcon/> <span className="text-[10px] mt-1">Arena</span>
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-slate-700 pt-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Production & Export</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <button onClick={() => applyMastering(rec.id, rec.blob)} disabled={rec.isMastering} className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700/50 rounded-md transition-colors disabled:opacity-50">
                                        {rec.isMastering ? 'Mastering...' : <><SparklesIcon /> AI Master</>}
                                    </button>
                                    <button onClick={() => addGuitar(rec.id, rec.blob)} disabled={rec.isAddingGuitar} className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-900/50 hover:bg-orange-800 border border-orange-700/50 rounded-md transition-colors disabled:opacity-50">
                                        {rec.isAddingGuitar ? 'Adding...' : <><GuitarIcon /> Guitar</>}
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleDownload(rec.blob, rec.name)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-md transition-colors flex justify-center items-center"><DownloadIcon/> WAV</button>
                                    <button onClick={() => handleDownloadMp3(rec.id, rec.blob, rec.name)} disabled={rec.isConvertingToMp3} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-md transition-colors flex justify-center items-center disabled:opacity-50">
                                       {rec.isConvertingToMp3 ? '...' : <><DownloadIcon/> MP3</>}
                                    </button>
                                    <button onClick={() => handleDownloadMp4(rec.id, rec.blob, rec.name)} disabled={rec.isConvertingToMp4} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-md transition-colors flex justify-center items-center disabled:opacity-50">
                                       {rec.isConvertingToMp4 ? '...' : <><VideoIcon /> MP4</>}
                                    </button>
                                    {showShare && <button onClick={() => handleShare(rec.blob, rec.name)} className="w-10 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex justify-center items-center"><ShareIcon/></button>}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
             ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/30">
                    <MicIcon />
                    <p className="mt-2">Your recordings will appear here.</p>
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
