import React from 'react';

interface GameElementProps {
  id: number;
  type: 'heart' | 'bomb' | 'freeze';
  x: number;
  speed: number;
  isFrozen: boolean;
  onClick: () => void;
}

const GameElement: React.FC<GameElementProps> = ({ 
  id, 
  type, 
  x, 
  speed, 
  isFrozen, 
  onClick 
}) => {
  const getEmoji = () => {
    switch(type) {
      case 'heart': return '❤️';
      case 'bomb': return '💣';
      case 'freeze': return '❄️';
      default: return '❤️';
    }
  };

  const getClassName = () => {
    switch(type) {
      case 'heart': return 'game-element heart';
      case 'bomb': return 'game-element bomb';
      case 'freeze': return 'game-element freeze';
      default: return 'game-element heart';
    }
  };

  return (
    <div
      id={`element-${id}`}
      className={getClassName()}
      style={{
        left: `${x}vw`,
        animation: `fall ${speed}s linear forwards`,
        animationPlayState: isFrozen ? 'paused' : 'running'
      }}
      onClick={onClick}
    >
      {getEmoji()}
    </div>
  );
};

export default GameElement;
