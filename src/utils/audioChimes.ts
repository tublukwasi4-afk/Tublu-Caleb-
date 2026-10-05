// Web Audio API Synthesizer for high-fidelity gentle medication reminder sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundType = 'gentle_chime' | 'crystal_bell' | 'marimba' | 'zen_bowl';

export function playMedicationReminderSound(type: SoundType = 'gentle_chime', volume: number = 0.7): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (type === 'gentle_chime') {
      // Warm, two-note hospital/caregiver chime: F5 (698.46Hz) followed by A5 (880Hz) and C6 (1046.5Hz)
      const notes = [
        { freq: 698.46, delay: 0.0, dur: 1.2 },
        { freq: 880.00, delay: 0.25, dur: 1.4 },
        { freq: 1046.50, delay: 0.5, dur: 2.0 },
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        noteGain.gain.setValueAtTime(0, now + delay);
        noteGain.gain.linearRampToValueAtTime(0.4, now + delay + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });

    } else if (type === 'crystal_bell') {
      // Crystalline bell with harmonic overtones
      const freqs = [1046.5, 2093.0, 3135.9];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const decay = 1.8 - idx * 0.4;
        noteGain.gain.setValueAtTime(0.3 / (idx + 1), now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay);
      });

    } else if (type === 'marimba') {
      // Warm acoustic marimba double stroke
      const notes = [
        { freq: 523.25, delay: 0 },     // C5
        { freq: 659.25, delay: 0.18 },  // E5
        { freq: 783.99, delay: 0.36 },  // G5
      ];
      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        noteGain.gain.setValueAtTime(0.6, now + delay);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.55);
      });

    } else if (type === 'zen_bowl') {
      // Deep resonant meditative Tibetan singing bowl tone
      const baseFreq = 432.0; // Healing frequency
      const harmonics = [baseFreq, baseFreq * 2.01, baseFreq * 3.02];

      harmonics.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.35 / (i + 1), now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    }
  } catch (err) {
    console.warn('Audio playback not permitted yet by user interaction', err);
  }
}

export function playTestSound(type: SoundType, volume: number): void {
  playMedicationReminderSound(type, volume);
}

export function speakMedicineReminder(medicineName: string, strength: string, instruction?: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // cancel any active speech
    const text = `Time to take your ${medicineName} ${strength}. ${instruction ? instruction : ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis unavailable', e);
  }
}
