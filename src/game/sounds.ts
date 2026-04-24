let audioCtx: AudioContext | null = null
let bgMusicGain: GainNode | null = null
let bgMusicPlaying = false
let bgMusicOscillators: OscillatorNode[] = []

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playMeow() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()
  const vibrato = ctx.createOscillator()
  const vibratoGain = ctx.createGain()

  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(900, now)
  osc1.frequency.exponentialRampToValueAtTime(700, now + 0.08)
  osc1.frequency.exponentialRampToValueAtTime(550, now + 0.18)
  osc1.frequency.exponentialRampToValueAtTime(480, now + 0.35)
  osc1.frequency.exponentialRampToValueAtTime(350, now + 0.5)

  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(1800, now)
  osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.08)
  osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.18)
  osc2.frequency.exponentialRampToValueAtTime(960, now + 0.35)
  osc2.frequency.exponentialRampToValueAtTime(700, now + 0.5)

  vibrato.type = 'sine'
  vibrato.frequency.setValueAtTime(6, now)
  vibratoGain.gain.setValueAtTime(0, now)
  vibratoGain.gain.linearRampToValueAtTime(15, now + 0.1)
  vibratoGain.gain.linearRampToValueAtTime(8, now + 0.3)
  vibratoGain.gain.linearRampToValueAtTime(0, now + 0.5)
  vibrato.connect(vibratoGain)
  vibratoGain.connect(osc1.frequency)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.25, now + 0.03)
  gain.gain.setValueAtTime(0.25, now + 0.08)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.2)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.35)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0, now)
  gain2.gain.linearRampToValueAtTime(0.06, now + 0.03)
  gain2.gain.setValueAtTime(0.06, now + 0.08)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

  osc1.connect(gain)
  osc2.connect(gain2)
  gain.connect(ctx.destination)
  gain2.connect(ctx.destination)

  vibrato.start(now)
  osc1.start(now)
  osc2.start(now)
  vibrato.stop(now + 0.5)
  osc1.stop(now + 0.5)
  osc2.stop(now + 0.5)
}

export function playPurr() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(26, now)
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.setValueAtTime(20, now)
  lfoGain.gain.setValueAtTime(10, now)
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.3)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
  osc.connect(gain)
  gain.connect(ctx.destination)
  lfo.start(now)
  osc.start(now)
  lfo.stop(now + 0.8)
  osc.stop(now + 0.8)
}

export function playSplash() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const bufferSize = ctx.sampleRate * 0.3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15))
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(3000, now)
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.3)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(now)
}

export function playCatchFish() {
  const ctx = getCtx()
  const now = ctx.currentTime
  playSplash()
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + 0.15 + i * 0.1)
    gain.gain.setValueAtTime(0, now + 0.15 + i * 0.1)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15 + i * 0.1 + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15 + i * 0.1 + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + 0.15 + i * 0.1)
    osc.stop(now + 0.15 + i * 0.1 + 0.2)
  })
}

export function playFeed() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
  setTimeout(() => playMeow(), 200)
}

export function playCoin() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(988, now)
  osc.frequency.setValueAtTime(1319, now + 0.08)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

export function playBuy() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const notes = [784, 988, 1175]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + i * 0.08)
    gain.gain.setValueAtTime(0.15, now + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + i * 0.08)
    osc.stop(now + i * 0.08 + 0.15)
  })
}

export function playApplause() {
  const ctx = getCtx()
  const now = ctx.currentTime
  for (let c = 0; c < 6; c++) {
    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5))
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000 + Math.random() * 2000, now)
    filter.Q.setValueAtTime(1, now)
    const gain = ctx.createGain()
    const t = now + c * 0.12 + Math.random() * 0.05
    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(t)
  }
}

export function playPerform() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const melody = [523, 587, 659, 784, 659, 784, 880]
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + i * 0.12)
    gain.gain.setValueAtTime(0.15, now + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.1)
  })
}

export function playEvolution() {
  const ctx = getCtx()
  const now = ctx.currentTime
  const notes = [262, 330, 392, 523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + i * 0.12)
    gain.gain.setValueAtTime(0.2, now + i * 0.12)
    gain.gain.setValueAtTime(0.2, now + i * 0.12 + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.3)
  })
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1047, now + 0.84)
  osc2.frequency.setValueAtTime(1319, now + 0.96)
  osc2.frequency.setValueAtTime(1568, now + 1.08)
  gain2.gain.setValueAtTime(0.25, now + 0.84)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.5)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.84)
  osc2.stop(now + 1.5)
}

const BG_MELODY = [
  { note: 392, dur: 0.4 },
  { note: 440, dur: 0.4 },
  { note: 494, dur: 0.4 },
  { note: 523, dur: 0.8 },
  { note: 494, dur: 0.4 },
  { note: 440, dur: 0.4 },
  { note: 392, dur: 0.8 },
  { note: 330, dur: 0.4 },
  { note: 349, dur: 0.4 },
  { note: 392, dur: 0.4 },
  { note: 440, dur: 0.8 },
  { note: 392, dur: 0.4 },
  { note: 349, dur: 0.4 },
  { note: 330, dur: 0.8 },
  { note: 294, dur: 0.4 },
  { note: 330, dur: 0.4 },
  { note: 349, dur: 0.4 },
  { note: 392, dur: 0.8 },
  { note: 349, dur: 0.4 },
  { note: 330, dur: 0.4 },
  { note: 294, dur: 0.8 },
  { note: 262, dur: 0.4 },
  { note: 294, dur: 0.4 },
  { note: 330, dur: 0.4 },
  { note: 349, dur: 0.4 },
  { note: 392, dur: 0.4 },
  { note: 440, dur: 0.4 },
  { note: 392, dur: 0.8 },
  { note: 0, dur: 0.8 },
]

export function startBgMusic() {
  if (bgMusicPlaying) return
  bgMusicPlaying = true
  const ctx = getCtx()
  bgMusicGain = ctx.createGain()
  bgMusicGain.gain.setValueAtTime(0.06, ctx.currentTime)
  bgMusicGain.connect(ctx.destination)
  scheduleBgLoop(ctx)
}

function scheduleBgLoop(ctx: AudioContext) {
  if (!bgMusicPlaying || !bgMusicGain) return
  let t = ctx.currentTime + 0.05
  for (const { note, dur } of BG_MELODY) {
    if (note > 0) {
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(note, t)
      noteGain.gain.setValueAtTime(0.5, t)
      noteGain.gain.setValueAtTime(0.5, t + dur * 0.7)
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.95)
      osc.connect(noteGain)
      noteGain.connect(bgMusicGain!)
      osc.start(t)
      osc.stop(t + dur)
      bgMusicOscillators.push(osc)
      const bassOsc = ctx.createOscillator()
      const bassGain = ctx.createGain()
      bassOsc.type = 'triangle'
      bassOsc.frequency.setValueAtTime(note / 2, t)
      bassGain.gain.setValueAtTime(0.3, t)
      bassGain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.9)
      bassOsc.connect(bassGain)
      bassGain.connect(bgMusicGain!)
      bassOsc.start(t)
      bassOsc.stop(t + dur)
      bgMusicOscillators.push(bassOsc)
    }
    t += dur
  }
  const totalDur = BG_MELODY.reduce((s, n) => s + n.dur, 0)
  setTimeout(() => {
    bgMusicOscillators = []
    scheduleBgLoop(ctx)
  }, totalDur * 1000 - 100)
}

export function stopBgMusic() {
  bgMusicPlaying = false
  bgMusicOscillators.forEach(o => {
    try { o.stop() } catch {}
  })
  bgMusicOscillators = []
}

export function toggleBgMusic(): boolean {
  if (bgMusicPlaying) {
    stopBgMusic()
  } else {
    startBgMusic()
  }
  return bgMusicPlaying
}

export function isBgMusicPlaying(): boolean {
  return bgMusicPlaying
}

export function setBgMusicVolume(vol: number) {
  if (bgMusicGain && audioCtx) {
    bgMusicGain.gain.setValueAtTime(vol, audioCtx.currentTime)
  }
}
