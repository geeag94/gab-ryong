import { useState, useEffect, useCallback } from 'react';
import {
  playEat, playPlay, playClean, playTrain, playSleep,
  playGift, playEvolve, playGameOver, playPoopSpawn,
  playWarning, playXP
} from '../utils/sound';

const STORAGE_KEY = 'tamagotchi_state_v2';

const initialState = {
  hunger: 100,
  boredom: 100,
  xp: 0,
  stage: 0,
  poops: [],
  gameOver: false,
  isDimmed: false,
};

export function useTamagotchi() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
    } catch {
      // 파싱 에러 시 기본값 사용
    }
    return initialState;
  });

  const [characterAction, setCharacterAction] = useState(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [giftReady, setGiftReady] = useState(false);

  // localStorage 저장
  useEffect(() => {
    try {
      const saveData = {
        hunger: state.hunger,
        boredom: state.boredom,
        xp: state.xp,
        stage: state.stage,
        poops: state.poops,
        gameOver: state.gameOver,
        isDimmed: state.isDimmed,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // 저장 실패 무시
    }
  }, [state]);

  // 게임 루프: 5초마다 스탯 감소
  useEffect(() => {
    if (state.gameOver || isSleeping) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.gameOver) return prev;

        let decay = 5;
        if (prev.poops.length > 0) decay = 10;
        if (prev.poops.length >= 5) decay = 15;

        const newHunger = Math.max(0, prev.hunger - decay);
        const newBoredom = Math.max(0, prev.boredom - decay);

        // 경고 사운드: 30 이하로 떨어질 때
        if ((prev.hunger > 30 && newHunger <= 30) || (prev.boredom > 30 && newBoredom <= 30)) {
          playWarning();
        }

        if (newHunger === 0 || newBoredom === 0) {
          playGameOver();
          return { ...prev, hunger: newHunger, boredom: newBoredom, gameOver: true };
        }

        return { ...prev, hunger: newHunger, boredom: newBoredom };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [state.gameOver, isSleeping]);

  // 잠자기 중 스탯 감소 (절반 속도)
  useEffect(() => {
    if (state.gameOver || !isSleeping) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.gameOver) return prev;

        let decay = 2; // 절반 감소
        if (prev.poops.length > 0) decay = 5;
        if (prev.poops.length >= 5) decay = 7;

        const newHunger = Math.max(0, prev.hunger - decay);
        const newBoredom = Math.max(0, prev.boredom - decay);

        if (newHunger === 0 || newBoredom === 0) {
          return { ...prev, hunger: newHunger, boredom: newBoredom, gameOver: true };
        }

        return { ...prev, hunger: newHunger, boredom: newBoredom };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [state.gameOver, isSleeping]);

  // 잠자기 타이머 (10초 후 해제)
  useEffect(() => {
    if (!isSleeping) return;
    const t = setTimeout(() => setIsSleeping(false), 10000);
    return () => clearTimeout(t);
  }, [isSleeping]);

  // 랜덤 선물 타이머 (3분마다)
  useEffect(() => {
    if (state.gameOver || state.xp < 50 || giftReady) return;
    
    const interval = setInterval(() => {
      setGiftReady(true);
    }, 180000); // 3분

    return () => clearInterval(interval);
  }, [state.gameOver, state.xp, giftReady]);

  // 진화 체크
  useEffect(() => {
    if (state.gameOver) return;

    let nextStage = null;
    if (state.stage === 0 && state.xp >= 50) nextStage = 1;
    else if (state.stage === 1 && state.xp >= 100) nextStage = 2;

    if (nextStage !== null) {
      playEvolve();
      setIsEvolving(true);
      const t1 = setTimeout(() => {
        setState((prev) => ({ ...prev, stage: nextStage }));
        const t2 = setTimeout(() => setIsEvolving(false), 300);
        return () => clearTimeout(t2);
      }, 0);
      return () => clearTimeout(t1);
    }
  }, [state.xp, state.stage, state.gameOver]);

  const feed = useCallback(() => {
    if (state.gameOver || isSleeping) return;
    playEat();
    playXP();
    setState((prev) => {
      const newPoops = [...prev.poops];
      if (Math.random() < 0.3 && newPoops.length < 5) {
        newPoops.push(Date.now());
        playPoopSpawn();
      }
      return {
        ...prev,
        hunger: Math.min(100, prev.hunger + 20),
        xp: prev.xp + 10,
        poops: newPoops,
      };
    });
    setCharacterAction('eating');
    setTimeout(() => setCharacterAction(null), 1500);
  }, [state.gameOver, isSleeping]);

  const play = useCallback(() => {
    if (state.gameOver || isSleeping) return;
    playPlay();
    playXP();
    setState((prev) => ({
      ...prev,
      boredom: Math.min(100, prev.boredom + 20),
      xp: prev.xp + 10,
    }));
    setCharacterAction('playing');
    setTimeout(() => setCharacterAction(null), 1500);
  }, [state.gameOver, isSleeping]);

  const clean = useCallback(() => {
    if (state.gameOver || isSleeping) return;
    playClean();
    setState((prev) => ({ ...prev, poops: [] }));
  }, [state.gameOver, isSleeping]);

  const train = useCallback(() => {
    if (state.gameOver || isSleeping) return;
    playTrain();
    playXP();
    setState((prev) => ({
      ...prev,
      hunger: Math.max(0, prev.hunger - 10),
      boredom: Math.max(0, prev.boredom - 10),
      xp: prev.xp + 25,
    }));
    setCharacterAction('training');
    setTimeout(() => setCharacterAction(null), 1500);
  }, [state.gameOver, isSleeping]);

  const sleep = useCallback(() => {
    if (state.gameOver || isSleeping) return;
    playSleep();
    setIsSleeping(true);
    setCharacterAction('sleeping');
    setTimeout(() => setCharacterAction(null), 1500);
  }, [state.gameOver, isSleeping]);

  const toggleDim = useCallback(() => {
    setState((prev) => ({ ...prev, isDimmed: !prev.isDimmed }));
  }, []);

  const openInfo = useCallback(() => {
    setShowInfo(true);
    setTimeout(() => setShowInfo(false), 3000);
  }, []);

  const claimGift = useCallback(() => {
    if (!giftReady) return;
    playGift();
    playXP();
    const bonus = Math.floor(Math.random() * 11) + 5; // 5~15 XP
    const heal = Math.floor(Math.random() * 11) + 10; // 10~20 스탯 회복
    setState((prev) => ({
      ...prev,
      xp: prev.xp + bonus,
      hunger: Math.min(100, prev.hunger + heal),
      boredom: Math.min(100, prev.boredom + heal),
    }));
    setGiftReady(false);
    setCharacterAction('gift');
    setTimeout(() => setCharacterAction(null), 1500);
  }, [giftReady]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setCharacterAction(null);
    setIsEvolving(false);
    setIsSleeping(false);
    setShowInfo(false);
    setGiftReady(false);
  }, []);

  return {
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
    reset,
  };
}
