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
    switch (type) {
      case 'heart': return '❤️';
      case 'bomb': return '💣';
      case 'freeze': return '❄️';
      default: return '❤️';
    }
  };

  const getClassName = () => {
    const baseClass = 'game-element';
    const typeClass = type;
    const frozenClass = isFrozen ? 'frozen' : '';

    return `${baseClass} ${typeClass} ${frozenClass}`;
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