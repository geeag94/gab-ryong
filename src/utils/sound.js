// Web Audio API를 활용한 8비트 레트로 사운드 엔진
let audioCtx = null;
let isAudioResumed = false;

// AudioContext 생성 및 resume
export async function ensureAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  
  isAudioResumed = true;
  return audioCtx;
}

function getAudioContext() {
  return audioCtx;
}

// 기본 사운드 생성 헬퍼
function playTone({ type = 'square', frequency = 440, duration = 0.1, volume = 0.1, startTime = 0 }) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

// 1. 버튼 클릭 - 삑- (Square 880Hz)
export function playBeep() {
  playTone({ type: 'square', frequency: 880, duration: 0.1, volume: 0.1 });
}

// 2. 밥먹기 - 냠냠 (Sawtooth, 200→400Hz 2회)
export function playEat() {
  playTone({ type: 'sawtooth', frequency: 200, duration: 0.08, volume: 0.1 });
  playTone({ type: 'sawtooth', frequency: 400, duration: 0.08, volume: 0.1, startTime: 0.12 });
}

// 3. 똥치우기 - 휙 (Noise burst)
export function playClean() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  noise.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

// 4. 놀아주기 - 띵띵 (Triangle 도레미)
export function playPlay() {
  const notes = [523.25, 587.33, 659.25]; // C5 D5 E5
  notes.forEach((freq, i) => {
    playTone({ type: 'triangle', frequency: freq, duration: 0.12, volume: 0.12, startTime: i * 0.15 });
  });
}

// 5. 훈련 - 쉭- (Sawtooth 주파수 상승)
export function playTrain() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// 6. 잠자기 - Zzz... (Sine 저주파)
export function playSleep() {
  playTone({ type: 'sine', frequency: 150, duration: 0.5, volume: 0.08 });
  playTone({ type: 'sine', frequency: 120, duration: 0.5, volume: 0.08, startTime: 0.25 });
}

// 7. 선물 - 따란- (Square 화음)
export function playGift() {
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    playTone({ type: 'square', frequency: freq, duration: 0.3, volume: 0.08, startTime: i * 0.12 });
  });
}

// 8. 진화 - 반짝~ (빠른 아르페지오)
export function playEvolve() {
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    playTone({ type: 'square', frequency: freq, duration: 0.1, volume: 0.1, startTime: i * 0.08 });
  });
}

// 9. 게임 오버 - 슬픔 (Sine 주파수 하강)
export function playGameOver() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1);
}

// 10. 똥 생성 - 뽕 (Square 저주파)
export function playPoopSpawn() {
  playTone({ type: 'square', frequency: 100, duration: 0.15, volume: 0.1 });
}

// 11. 경고음 - 삐용삐용 (Square 1000Hz 2회)
export function playWarning() {
  playTone({ type: 'square', frequency: 1000, duration: 0.1, volume: 0.12 });
  playTone({ type: 'square', frequency: 1000, duration: 0.1, volume: 0.12, startTime: 0.2 });
}

// 12. XP 획득 - 띵 (Triangle 높은 음)
export function playXP() {
  playTone({ type: 'triangle', frequency: 1000, duration: 0.1, volume: 0.1 });
}

// === 메인 테마 BGM ===
let themeInterval = null;
let themeIsPlaying = false;

const THEME_NOTES = [
  { note: 523.25, dur: 400 },  // C5
  { note: 523.25, dur: 400 },  // C5
  { note: 659.25, dur: 400 },  // E5
  { note: 783.99, dur: 400 },  // G5
  { note: 783.99, dur: 400 },  // G5
  { note: 659.25, dur: 400 },  // E5
  { note: 523.25, dur: 400 },  // C5
  { note: 0, dur: 200 },       // 쉼표
  { note: 440.00, dur: 400 },  // A4
  { note: 523.25, dur: 400 },  // C5
  { note: 659.25, dur: 400 },  // E5
  { note: 440.00, dur: 400 },  // A4
  { note: 349.23, dur: 400 },  // F4
  { note: 440.00, dur: 400 },  // A4
  { note: 523.25, dur: 400 },  // C5
  { note: 0, dur: 200 },       // 쉼표
];

export async function playMainTheme() {
  await ensureAudioContext();
  const ctx = getAudioContext();
  if (!ctx) return;
  if (themeIsPlaying) return;
  
  stopMainTheme();
  themeIsPlaying = true;
  
  const volume = 0.06; // 배경용 음량
  let noteIndex = 0;

  function playNextNote() {
    if (!themeIsPlaying) return;
    
    const { note, dur } = THEME_NOTES[noteIndex];
    
    if (note > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur / 1000) - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (dur / 1000));
    }

    noteIndex = (noteIndex + 1) % THEME_NOTES.length;
    themeInterval = setTimeout(playNextNote, dur);
  }

  playNextNote();
}

export function stopMainTheme() {
  themeIsPlaying = false;
  if (themeInterval) {
    clearTimeout(themeInterval);
    themeInterval = null;
  }
}
