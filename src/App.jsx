import { useState, useEffect, useRef } from 'react';
import { useTamagotchi } from './hooks/useTamagotchi';
import { playBeep, playMainTheme, stopMainTheme, ensureAudioContext } from './utils/sound';
import { CharacterPixelArt, PoopPixelArt } from './components/PixelArt';

function App() {
  const { 
    state, 
    characterAction, 
    isEvolving, 
    isSleeping,
    showInfo,
    giftReady,
    feed, 
    play, 
    clean, 
    train,
    sleep,
    toggleDim,
    openInfo,
    claimGift,
    reset 
  } = useTamagotchi();

  const [audioPrompt, setAudioPrompt] = useState(true);
  const themeStarted = useRef(false);

  // 컴포넌트 마운트 시 바로 BGM 시도 (자동 재생)
  useEffect(() => {
    const tryAutoPlay = async () => {
      try {
        await playMainTheme();
        themeStarted.current = true;
        setAudioPrompt(false);
      } catch {
        // 자동 재생 차단됨 - 사용자 클릭 대기
      }
    };
    tryAutoPlay();
  }, []);

  // 첫 상호작용 시 BGM 활성화
  const enableAudio = async () => {
    if (themeStarted.current) return;
    try {
      await ensureAudioContext();
      await playMainTheme();
      themeStarted.current = true;
      setAudioPrompt(false);
    } catch (e) {
      console.log('Audio enable failed:', e);
    }
  };

  // 게임 오버 시 테마 정지
  useEffect(() => {
    if (state.gameOver) {
      stopMainTheme();
      themeStarted.current = false;
    }
  }, [state.gameOver]);

  const handleFeed = () => { enableAudio(); feed(); };
  const handlePlay = () => { enableAudio(); play(); };
  const handleClean = () => { enableAudio(); clean(); };
  const handleTrain = () => { enableAudio(); train(); };
  const handleSleep = () => { enableAudio(); sleep(); };
  const handleDim = () => { enableAudio(); playBeep(); toggleDim(); };
  const handleInfo = () => { enableAudio(); playBeep(); openInfo(); };
  const handleGift = () => { enableAudio(); claimGift(); };
  const handleReset = () => { 
    reset(); 
    setTimeout(() => {
      playMainTheme();
      themeStarted.current = true;
      setAudioPrompt(false);
    }, 100);
  };

  const renderGauge = (label, value) => {
    // 모바일에서는 5칸 게이지, 데스크톱에서는 10칸
    const isMobile = window.innerWidth < 640;
    const segments = isMobile ? 5 : 10;
    const filled = Math.round((value / 100) * segments);
    const bar = '█'.repeat(filled) + '░'.repeat(segments - filled);
    const warning = value <= 30 && value > 0;
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-base ${warning ? 'animate-pulse text-red-400' : 'text-green-300'}`} style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>
        <span className="font-bold shrink-0" style={{ minWidth: '4.5rem' }}>{label}:</span>
        <span className="tracking-widest whitespace-nowrap text-sm sm:text-base">{bar}</span>
        <span className="text-xs sm:text-sm opacity-80 whitespace-nowrap">[{value}/100]</span>
        {warning && <span className="text-base sm:text-lg">!</span>}
      </div>
    );
  };

  const getInfoText = () => {
    const nextXp = state.stage === 0 ? 50 : state.stage === 1 ? 100 : 'MAX';
    const penalty = state.poops.length === 0 ? '없음' : state.poops.length < 5 ? '2배 감소' : '3배 감소 + 위험!';
    return [
      "=== INFO ===",
      `STAGE: ${state.stage + 1}/3`,
      `NEXT XP: ${nextXp}`,
      `POOP PENALTY: ${penalty}`,
      `SLEEP: 스탯 감소 절반`,
      `TRAIN: XP+25 / 스탯-10`,
      "============"
    ];
  };

  const buttonClass = "py-3 px-2 bg-green-700/80 hover:bg-green-600 text-green-100 font-bold text-xs rounded-xl border border-green-500/50 shadow-lg active:scale-95 transition-transform flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonTextStyle = { fontFamily: "'Fredoka', 'Jua', sans-serif", fontSize: '12px', letterSpacing: '0.5px', fontWeight: 600 };
  const iconBox = (icon) => [
    " .---.",
    ` | ${icon} |`,
    " '---' "
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-md px-2 sm:px-4">
        {/* 게임 타이틀 */}
        <h1 className="text-3xl font-bold text-green-400 tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>
          갑룡이
        </h1>
        <h2 className="text-sm text-green-500 mb-4 tracking-widest" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>
          GAB-RYONG
        </h2>

        {/* 기기 프레임 */}
        <div className="relative bg-gray-800/60 border-4 border-green-400/60 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-6 shadow-[0_0_40px_rgba(74,222,128,0.25)] backdrop-blur-sm w-full">
        
        {/* LCD 액정 */}
        <div 
          className={`relative bg-green-950/40 border-2 border-green-500/40 rounded-2xl p-3 sm:p-5 min-h-[320px] sm:min-h-[380px] flex flex-col justify-between overflow-hidden ${isEvolving ? 'animate-flash' : ''} ${state.isDimmed ? 'opacity-40' : 'opacity-100'} transition-opacity duration-500`}
          onClick={enableAudio}
        >
          
          {/* 스탯 게이지 */}
          <div className="space-y-1 mb-2 z-10">
            {renderGauge('Hunger', state.hunger)}
            {renderGauge('Boredom', state.boredom)}
            <div className="text-sm text-green-400/70 mt-1 flex justify-between" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>
              <span>XP: {state.xp} | STAGE: {state.stage + 1}</span>
              {isSleeping && <span className="text-blue-400 animate-pulse">[SLEEPING]</span>}
            </div>
          </div>

          {/* 캐릭터 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-4 z-10">
            {/* 똥 5개 경고 */}
            {state.poops.length >= 5 && !state.gameOver && (
              <div className="absolute top-0 text-red-500 font-bold text-xs animate-pulse tracking-wider">
                ! 위험! 청소 필요!
              </div>
            )}
            
            {/* 선물 알림 */}
            {giftReady && !state.gameOver && !showInfo && (
              <div className="absolute top-8 text-yellow-400 font-bold text-sm animate-bounce">
                🎁 선물 도착!
              </div>
            )}
            
            {/* 캐릭터 본체 - 픽셀 아트 */}
            <div className={`transition-transform duration-300 ${!characterAction && !state.gameOver && !isSleeping ? 'animate-wiggle' : 'scale-110'}`}>
              <CharacterPixelArt 
                stage={state.stage} 
                action={characterAction} 
                isGameOver={state.gameOver}
                isSleeping={isSleeping}
              />
            </div>

            {/* 똥 표시 (하단 가로) - 픽셀 아트 */}
            {!state.gameOver && state.poops.length > 0 && (
              <div className="flex gap-3 mt-6 justify-center flex-wrap">
                {state.poops.map((id) => (
                  <div key={id} style={{ animation: 'wiggle 1s infinite steps(2)' }}>
                    <PoopPixelArt />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오디오 활성화 프롬프트 */}
          {audioPrompt && !state.gameOver && (
            <div 
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 rounded-xl cursor-pointer"
              onClick={enableAudio}
            >
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-green-400 font-bold text-sm tracking-wider text-center" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>
                CLICK TO<br/>ENABLE BGM
              </p>
              <p className="text-green-600 text-sm mt-2" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>(브라우저 정책으로 인해 필요)</p>
            </div>
          )}

          {/* 정보창 오버레이 */}
          {showInfo && (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-30 rounded-xl">
              <pre className="font-mono text-xs leading-tight tracking-normal text-green-400 whitespace-pre text-center">
                {getInfoText().join('\n')}
              </pre>
            </div>
          )}

          {/* 게임 오버 오버레이 */}
          {state.gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 rounded-xl">
              <CharacterPixelArt 
                stage={state.stage} 
                action={characterAction} 
                isGameOver={true}
                isSleeping={false}
              />
              <p className="text-green-500 font-bold text-lg mb-6 tracking-widest mt-4" style={{ fontFamily: "'Fredoka', 'Jua', sans-serif" }}>R.I.P</p>
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all active:scale-95"
              >
                🔄 다시 부활시키기
              </button>
            </div>
          )}

        </div>

        {/* 컨트롤 버튼 - 2줄 그리드 */}
        {!state.gameOver && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button 
              onClick={handleFeed}
              disabled={isSleeping}
              className={buttonClass}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('🍖').join('\n')}
              </pre>
              <span style={buttonTextStyle}>밥주기</span>
            </button>
            <button 
              onClick={handleClean}
              disabled={isSleeping}
              className={buttonClass}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('✨').join('\n')}
              </pre>
              <span style={buttonTextStyle}>똥치우기</span>
            </button>
            <button 
              onClick={handlePlay}
              disabled={isSleeping}
              className={buttonClass}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('♪').join('\n')}
              </pre>
              <span style={buttonTextStyle}>놀아주기</span>
            </button>
            <button 
              onClick={handleTrain}
              disabled={isSleeping}
              className={buttonClass}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('💪').join('\n')}
              </pre>
              <span style={buttonTextStyle}>훈련</span>
            </button>
            <button 
              onClick={handleSleep}
              disabled={isSleeping}
              className={`${buttonClass} ${isSleeping ? 'bg-blue-700/80 border-blue-500/50' : ''}`}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('💤').join('\n')}
              </pre>
              <span style={buttonTextStyle}>휴식</span>
            </button>
            <button 
              onClick={handleGift}
              disabled={isSleeping || !giftReady}
              className={`${buttonClass} ${giftReady ? 'bg-yellow-700/80 border-yellow-500/50 animate-pulse' : ''}`}
            >
              <pre className="font-mono text-[10px] leading-none mb-1">
                {iconBox('🎁').join('\n')}
              </pre>
              <span style={buttonTextStyle}>선물</span>
            </button>
          </div>
        )}

        {/* 하단 토글 버튼 */}
        {!state.gameOver && (
          <div className="flex gap-2 mt-3 justify-center">
            <button 
              onClick={handleInfo}
              className="px-3 py-2 bg-green-800/60 hover:bg-green-700 text-green-100 text-xs rounded-lg border border-green-600/50"
            >
              ℹ️ 정보
            </button>
            <button 
              onClick={handleDim}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${state.isDimmed ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-green-800/60 hover:bg-green-700 text-green-100 border-green-600/50'}`}
            >
              {state.isDimmed ? '🔅 밝게' : '🔆 어둡게'}
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default App
