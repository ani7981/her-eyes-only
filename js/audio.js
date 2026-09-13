/**
 * Her Eyes Only — Audio Synthesizer & Music Player
 * Generates futuristic HUD sound effects & romantic ambient music
 * entirely via the Web Audio API without external file dependencies.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.musicGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sci-Fi Scan Beep / Radar Chirp
  playScanBlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio blip error:', e);
    }
  }

  // Eye Lock Confirmation Tone
  playEyeLockBeep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1760, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio eye lock error:', e);
    }
  }

  // Access Granted - Harmonious Triumphant Chime
  playAccessGranted() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Beautiful ascending major chord: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.8);
      });
    } catch (e) {
      console.warn('Audio granted error:', e);
    }
  }

  // Access Denied - Futuristic Cyber Glitch & Warning Buzz
  playAccessDenied() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18].forEach(startOffset => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now + startOffset);
        osc.frequency.setValueAtTime(110, now + startOffset + 0.08);

        gain.gain.setValueAtTime(0.12, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + 0.15);
      });
    } catch (e) {
      console.warn('Audio denied error:', e);
    }
  }

  // Romantic Music Box / Ambient Arpeggio Synthesizer
  startRomanticMusic() {
    if (this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.updateMusicUI(true);

    // Warm Romantic Chord Progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
    // Frequencies (Hz):
    const chords = [
      // Cmaj9: C3, G3, B3, E4, D5
      [130.81, 196.00, 246.94, 329.63, 587.33, 493.88],
      // Am9: A2, E3, G3, C4, B4
      [110.00, 164.81, 196.00, 261.63, 493.88, 392.00],
      // Fmaj7: F2, C3, E3, A3, E4
      [87.31, 130.81, 164.81, 220.00, 329.63, 440.00],
      // Gsus4 / G: G2, D3, G3, C4, D4
      [98.00, 146.83, 196.00, 261.63, 293.66, 392.00]
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || this.isMuted) {
        if (this.isMusicPlaying) {
          this.musicTimer = setTimeout(playNextNote, 320);
        }
        return;
      }

      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx];

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Music box / electric piano bell timbre (combination of sine + soft harmonics)
        osc.type = noteIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const baseVol = noteIdx === 0 ? 0.045 : 0.035;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(baseVol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
      } catch (e) {
        // audio context handling
      }

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }

      // Tempo: gentle 280ms arpeggio pulses
      this.musicTimer = setTimeout(playNextNote, 280);
    };

    playNextNote();
  }

  stopRomanticMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.updateMusicUI(false);
  }

  toggleRomanticMusic() {
    if (this.isMusicPlaying) {
      this.stopRomanticMusic();
    } else {
      this.startRomanticMusic();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
      if (this.isMuted) {
        btn.classList.add('opacity-50');
      } else {
        btn.classList.remove('opacity-50');
      }
    }
    return this.isMuted;
  }

  updateMusicUI(playing) {
    const waves = document.querySelectorAll('.music-wave-bar');
    const statusText = document.getElementById('music-status-text');
    waves.forEach(bar => {
      if (playing) {
        bar.classList.remove('h-1');
        bar.classList.add('animate-pulse');
      } else {
        bar.classList.add('h-1');
        bar.classList.remove('animate-pulse');
      }
    });
    if (statusText) {
      statusText.innerText = playing ? 'Playing our melody ♡' : 'Music paused';
    }
  }
}

window.soundController = new SoundController();
