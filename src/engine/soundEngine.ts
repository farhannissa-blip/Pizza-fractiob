/**
 * PROCEDURAL WEB AUDIO ENGINE — Pizza Fraction Frenzy
 * Menghasilkan efek suara (SFX) dan musik latar restoran pizza Italia
 * secara prosedural menggunakan Web Audio API tanpa ketergantungan file eksternal.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private musicInterval: number | null = null;
  private musicStep = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseMusicLoop();
        } else if (this.musicEnabled && this.ctx) {
          this.startMusicLoop();
        }
      });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusicLoop();
    } else {
      this.pauseMusicLoop();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    slideToFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /** Suara pelanggan datang (Bel pintu restoran) */
  public playCustomerArrive() {
    if (!this.sfxEnabled) return;
    this.playTone(659.25, 0.16, 'triangle', 0.14, 0);    // E5
    this.playTone(523.25, 0.28, 'triangle', 0.14, 0.14); // C5
  }

  /** Suara pesanan diterima / tombol diklik */
  public playOrderPop() {
    if (!this.sfxEnabled) return;
    this.playTone(440, 0.08, 'sine', 0.12, 0, 660);
  }

  /** Suara pizza dipotong / memilih potongan pizza */
  public playSlicePizza() {
    if (!this.sfxEnabled) return;
    this.playTone(580, 0.07, 'triangle', 0.14, 0, 820);
  }

  /** Suara oven menyala / menyajikan pizza hangat */
  public playOvenDing() {
    if (!this.sfxEnabled) return;
    this.playTone(1046.5, 0.35, 'sine', 0.16, 0); // C6 bell
    this.playTone(1567.98, 0.4, 'sine', 0.08, 0.04);
  }

  /** Suara koin bertambah */
  public playCoin() {
    if (!this.sfxEnabled) return;
    this.playTone(987.77, 0.09, 'sine', 0.15, 0);    // B5
    this.playTone(1318.51, 0.24, 'sine', 0.16, 0.08); // E6
  }

  /** Suara jawaban benar + efek combo */
  public playCorrect(combo = 1) {
    if (!this.sfxEnabled) return;
    const boost = Math.min(combo - 1, 5) * 35;
    this.playTone(523.25 + boost, 0.12, 'triangle', 0.16, 0);
    this.playTone(659.25 + boost, 0.12, 'triangle', 0.16, 0.1);
    this.playTone(783.99 + boost, 0.14, 'triangle', 0.16, 0.2);
    this.playTone(1046.5 + boost, 0.32, 'triangle', 0.18, 0.3);
  }

  /** Suara jawaban kurang tepat (lembut & tidak menghukum) */
  public playWrong() {
    if (!this.sfxEnabled) return;
    this.playTone(330, 0.18, 'sine', 0.14, 0, 290);
    this.playTone(261.63, 0.28, 'sine', 0.14, 0.16, 220);
  }

  /** Suara pelanggan marah & pergi saat waktu penyajian 10-20 detik habis */
  public playCustomerAngry() {
    if (!this.sfxEnabled) return;
    this.playTone(240, 0.22, 'sawtooth', 0.14, 0, 180);
    this.playTone(175, 0.38, 'sawtooth', 0.16, 0.2, 115);
  }

  /** Suara taburan topping pizza saat penyajian */
  public playToppingSprinkle() {
    if (!this.sfxEnabled) return;
    const notes = [659.25, 783.99, 987.77, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.06, 'triangle', 0.11, idx * 0.045);
    });
  }

  /** Suara detak timer saat sisa waktu <= 5 detik */
  public playTimerTick() {
    if (!this.sfxEnabled) return;
    this.playTone(880, 0.035, 'sine', 0.08, 0);
  }

  /** Suara level berhasil / bintang muncul */
  public playLevelWin() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const delays = [0, 0.11, 0.22, 0.33, 0.48, 0.6];
    const durations = [0.1, 0.1, 0.1, 0.15, 0.1, 0.45];
    notes.forEach((n, idx) => {
      this.playTone(n, durations[idx], 'triangle', 0.18, delays[idx]);
    });
  }

  /**
   * Suara Sorak-Sorai ('Cheering') & Tepuk Tangan Meriah ('Applause')
   * Dipicu saat animasi perayaan 'Level Up!' muncul di tengah layar.
   */
  public playCheerAndApplause() {
    if (!this.sfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Lapisan Tepuk Tangan Meriah (Multi-Clap Bandpass Noise Bursts)
    const clapCount = 26;
    for (let i = 0; i < clapCount; i++) {
      const clapDelay = i * 0.058 + (i % 3) * 0.014;
      const clapDur = 0.055 + (i % 4) * 0.012;
      const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * clapDur));
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < sampleCount; j++) {
        // Envelope tajam di awal lalu meluruh seperti tepukan tangan manusia
        const env = Math.pow(1 - j / sampleCount, 1.8);
        data[j] = (Math.random() * 2 - 1) * env;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      // Variasi frekuensi tiap tepukan (1100 Hz - 2300 Hz) agar terdengar seperti banyak orang
      filter.frequency.setValueAtTime(1150 + ((i * 173) % 1150), now + clapDelay);
      filter.Q.setValueAtTime(1.8, now + clapDelay);

      // Kurva volume kerumunan (menguat di tengah lalu mereda halus)
      const crowdEnvelope =
        i < 5
          ? (i + 1) / 5
          : i > clapCount - 7
          ? Math.max(0.15, (clapCount - i) / 7)
          : 1;

      const clapGain = ctx.createGain();
      const peakGain = 0.14 * crowdEnvelope;
      clapGain.gain.setValueAtTime(0.001, now + clapDelay);
      clapGain.gain.linearRampToValueAtTime(peakGain, now + clapDelay + 0.006);
      clapGain.gain.exponentialRampToValueAtTime(0.0008, now + clapDelay + clapDur);

      noiseSource.connect(filter);
      filter.connect(clapGain);
      clapGain.connect(ctx.destination);

      noiseSource.start(now + clapDelay);
      noiseSource.stop(now + clapDelay + clapDur + 0.01);
    }

    // 2. Lapisan Sorak-Sorai Gembira ("Horeee / Cheering" Vocal Formant Swell)
    const cheerVoices = [
      { startFreq: 392.0, peakFreq: 587.33, delay: 0.08, dur: 0.75, vol: 0.07 },
      { startFreq: 493.88, peakFreq: 783.99, delay: 0.14, dur: 0.82, vol: 0.07 },
      { startFreq: 587.33, peakFreq: 987.77, delay: 0.2, dur: 0.88, vol: 0.065 },
      { startFreq: 659.25, peakFreq: 1046.5, delay: 0.26, dur: 0.92, vol: 0.065 },
    ];

    cheerVoices.forEach((v) => {
      const osc = ctx.createOscillator();
      const formantFilter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(v.startFreq, now + v.delay);
      osc.frequency.exponentialRampToValueAtTime(
        v.peakFreq,
        now + v.delay + v.dur * 0.65
      );
      osc.frequency.exponentialRampToValueAtTime(
        v.peakFreq * 0.94,
        now + v.delay + v.dur
      );

      // Filter formant vokal "Aaah / Yaaay"
      formantFilter.type = 'bandpass';
      formantFilter.frequency.setValueAtTime(1050, now + v.delay);
      formantFilter.frequency.linearRampToValueAtTime(
        1650,
        now + v.delay + v.dur * 0.7
      );
      formantFilter.Q.setValueAtTime(2.4, now + v.delay);

      gain.gain.setValueAtTime(0.001, now + v.delay);
      gain.gain.linearRampToValueAtTime(v.vol, now + v.delay + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + v.delay + v.dur);

      osc.connect(formantFilter);
      formantFilter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + v.delay);
      osc.stop(now + v.delay + v.dur + 0.02);
    });

    // 3. Kilau Terompet & Bintang Kemenangan di Puncak Sorakan
    const sparkleNotes = [1046.5, 1318.51, 1567.98, 2093.0];
    sparkleNotes.forEach((freq, idx) => {
      this.playTone(freq, 0.22, 'triangle', 0.11, 0.35 + idx * 0.09);
    });
  }

  /** Suara upgrade restoran dibeli */
  public playUpgrade() {
    if (!this.sfxEnabled) return;
    this.playTone(440, 0.1, 'triangle', 0.15, 0);
    this.playTone(554.37, 0.1, 'triangle', 0.15, 0.09);
    this.playTone(659.25, 0.1, 'triangle', 0.15, 0.18);
    this.playTone(880, 0.3, 'triangle', 0.18, 0.27);
  }

  /** Musik latar pizzeria ringan & ceria */
  public startMusicLoop() {
    if (!this.musicEnabled || typeof window === 'undefined') return;
    if (this.musicInterval !== null) return;

    // Melodi Tarantella / Pizzeria ringan (frekuensi dalam Hz, 0 = istirahat)
    const melody = [
      392.0, 523.25, 659.25, 523.25,
      587.33, 493.88, 392.0, 0,
      440.0, 523.25, 659.25, 587.33,
      523.25, 0, 392.0, 0,
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || document.hidden) return;
      const note = melody[this.musicStep % melody.length];
      this.musicStep++;
      if (note > 0) {
        this.playTone(note, 0.22, 'sine', 0.035, 0);
      }
    }, 320);
  }

  public pauseMusicLoop() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
