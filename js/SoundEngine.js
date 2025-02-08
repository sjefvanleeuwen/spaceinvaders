class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.15;
        
        // Base frequency and semitone pattern for alien movement
        this.baseFreq = 55;
        this.currentNote = 0;
        this.semitones = [0, -1, -2, -3];
    }

    // Create noise buffer for laser sounds
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 0.05; // 50ms buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    playLaser(startFreq, endFreq, duration) {
        // Create noise
        const noiseBuffer = this.createNoiseBuffer();
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        // Create tone oscillator
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        // Create filters
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        noiseFilter.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        noiseFilter.Q.value = 5;

        // Create gain nodes
        const noiseGain = this.ctx.createGain();
        const oscGain = this.ctx.createGain();
        const mainGain = this.ctx.createGain();

        // Set gains
        noiseGain.gain.value = 0.3;
        oscGain.gain.value = 0.2;
        mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.001);
        mainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        // Connect everything
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        osc.connect(oscGain);
        noiseGain.connect(mainGain);
        oscGain.connect(mainGain);
        mainGain.connect(this.masterGain);

        // Start and stop
        noiseSource.start();
        osc.start();
        noiseSource.stop(this.ctx.currentTime + duration);
        osc.stop(this.ctx.currentTime + duration);
    }

    playerShoot() {
        // High to low laser sound
        this.playLaser(1200, 600, 0.15);
    }

    enemyShoot() {
        // Low to lower laser sound
        this.playLaser(300, 150, 0.2);
    }

    playPulse(frequency, duration) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = frequency;
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + 0.001);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    alienPulse() {
        const freq = this.baseFreq * Math.pow(2, this.semitones[this.currentNote] / 12);
        this.playPulse(freq, 0.05);
        this.currentNote = (this.currentNote + 1) % this.semitones.length;
    }

    createExplosion() {
        // Create a short noise burst
        const duration = 0.1;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Create explosive noise with decay
        for (let i = 0; i < bufferSize; i++) {
            const decay = 1 - (i / bufferSize);
            output[i] = (Math.random() * 2 - 1) * decay * decay;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Create filters for more "crunchy" sound
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1000;
        lowpass.Q.value = 10;

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 100;

        // Create distortion for more "crackle"
        const distortion = this.ctx.createWaveShaper();
        function makeDistortionCurve(amount) {
            const k = amount;
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(50);

        // Create gain node for volume control
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);

        // Connect everything
        source.connect(distortion);
        distortion.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Play the explosion
        source.start();
    }

    explosion() {
        // Create multiple noise bursts with slight variations
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createExplosion();
            }, i * 20);
        }
    }

    ufoSound() {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gainNode = this.ctx.createGain();

        // Set up main oscillators with much lower frequencies
        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.value = 220;  // A3 (one octave lower)
        osc2.frequency.value = 222;  // Slightly detuned

        // Set up LFO for frequency modulation
        lfo.type = 'sine';
        lfo.frequency.value = 6;  // Keep same modulation rate
        lfoGain.gain.value = 10;  // Less modulation depth for lower frequency

        // Keep the quiet volume
        gainNode.gain.value = 0.04;

        // Connect LFO to oscillator frequencies
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        // Connect oscillators to output
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Start all oscillators
        lfo.start();
        osc1.start();
        osc2.start();

        return {
            stop: () => {
                const stopTime = this.ctx.currentTime + 0.1;
                gainNode.gain.linearRampToValueAtTime(0, stopTime);
                lfo.stop(stopTime);
                osc1.stop(stopTime);
                osc2.stop(stopTime);
            }
        };
    }
} 