class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playFlip() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playMatch() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.3);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playMismatch() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Low dual frequencies for buzz
      osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(138, this.ctx.currentTime);
      
      osc1.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.25);
      osc2.frequency.linearRampToValueAtTime(98, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.25);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playWin() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Beautiful major arpeggio and chord
      // C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6 (chord)
      const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      
      arpeggio.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });

      // Final big C major chord at the end
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.7);

        gain.gain.setValueAtTime(0, now + 0.7);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.7 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + 0.7);
        osc.stop(now + 0.7 + 0.9);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playAchievement() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High bright celebratory ring
      const osc = this.ctx.createOscillator();
      const oscMod = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const modGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4); // A6

      oscMod.type = 'sine';
      oscMod.frequency.setValueAtTime(6, now); // Vibrato speed
      
      modGain.gain.setValueAtTime(15, now); // Vibrato depth

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      oscMod.connect(modGain);
      modGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      oscMod.start();
      osc.start();
      oscMod.stop(now + 0.55);
      osc.stop(now + 0.55);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

export const audio = new SoundSynthesizer();
