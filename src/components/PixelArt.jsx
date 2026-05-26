import React from 'react';

// 픽셀 아트 데이터: 0 = 투명, 1 = 녹색
const PIXEL_SIZE = 4; // 각 픽셀의 px 크기

const STAGE_0_EGG = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
];

const STAGE_1_BABY = [
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,1,1,0,0,0,1,1,0,0],
];

const STAGE_2_MONSTER = [
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,1,1,1,0,0,0,1,1,1,0],
  [0,0,1,0,1,1,1,0,1,0,0],
  [0,1,0,1,1,1,1,1,0,1,0],
  [1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,1,1,1,1,1,0,0,1],
  [0,1,0,0,1,1,1,0,0,1,0],
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
];

const ACTION_EATING = [
  [0,0,1,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,0],
  [0,1,1,0,1,1,0,1,1],
  [0,1,0,1,1,1,1,0,1],
  [0,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,1,0,0],
];

const ACTION_PLAYING = [
  [1,0,0,0,1,0,0,0,1],
  [0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,1,0],
  [0,1,1,0,1,1,0,1,1],
  [0,1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,1,0,0],
];

const ACTION_SLEEPING = [
  [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0],
  [0,0,1,0,0,0,1,0,0],
  [0,1,0,1,1,1,0,1,0],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
];

const ACTION_TRAINING = [
  [0,0,0,1,1,1,0,0,0],
  [0,0,1,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,0],
  [0,1,1,0,0,0,1,1,0],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
];

const ACTION_GIFT = [
  [0,0,0,1,0,0,0],
  [0,0,1,1,1,0,0],
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
];

const TOMBSTONE = [
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0],
];

const POOP = [
  [0,0,1,1,0,0],
  [0,1,1,1,1,0],
  [0,1,1,1,1,0],
  [0,0,1,1,0,0],
];

function renderPixelArt(matrix, color = '#4ade80') {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  return (
    <div 
      className="inline-grid gap-0 mx-auto"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${PIXEL_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${PIXEL_SIZE}px)`,
      }}
    >
      {matrix.flatMap((row, rowIndex) => 
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="transition-colors duration-150"
            style={{
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: cell ? color : 'transparent',
              boxShadow: cell ? `0 0 ${PIXEL_SIZE/2}px ${color}` : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}

export function CharacterPixelArt({ stage, action, isGameOver, isSleeping }) {
  if (isGameOver) return renderPixelArt(TOMBSTONE, '#22c55e');
  if (action === 'eating') return renderPixelArt(ACTION_EATING);
  if (action === 'playing') return renderPixelArt(ACTION_PLAYING);
  if (action === 'training') return renderPixelArt(ACTION_TRAINING);
  if (action === 'gift') return renderPixelArt(ACTION_GIFT, '#facc15');
  if (isSleeping || action === 'sleeping') return renderPixelArt(ACTION_SLEEPING, '#60a5fa');
  
  if (stage === 0) return renderPixelArt(STAGE_0_EGG);
  if (stage === 1) return renderPixelArt(STAGE_1_BABY);
  return renderPixelArt(STAGE_2_MONSTER);
}

export function PoopPixelArt() {
  return renderPixelArt(POOP, '#eab308');
}
