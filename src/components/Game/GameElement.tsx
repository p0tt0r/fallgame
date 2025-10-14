import React, { useState } from 'react';
import ParticleSystem from '../Effectc/ParticleSystem';

interface GameElementProps {
  id: number;
  type: 'heart' | 'bomb' | 'freeze';
  x: number;
  speed: number;
  onClick: () => void;
  isFrozen: boolean;
}

const GameElement: React.FC<GameElementProps> = ({
  id, type, x, speed, onClick, isFrozen
}) => {
  const [isExploding, setIsExploding] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    if (isFrozen) return;

    // Получаем позицию элемента для частиц
    const element = document.getElementById(`element-${id}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setElementPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }

    // Запускаем анимацию взрыва/сбора
    setIsExploding(true);
    setShowParticles(true);

    // Вызываем обработчик с задержкой для анимации
    setTimeout(() => {
      onClick();
    }, 300);
  };

  const handleParticlesComplete = () => {
    setShowParticles(false);
  };

  const getElementContent = () => {
    switch (type) {
      case 'heart': return '❤️';
      case 'bomb': return '💣';
      case 'freeze': return '❄️';
      default: return '';
    }
  };

  const getElementClass = () => {
    let className = `game-element ${type}`;
    if (isFrozen) className += ' frozen';
    if (isExploding) className += type === 'bomb' ? ' exploding' : ' collected';
    return className;
  };

  return (
    <>
      <div
        id={`element-${id}`}
        className={getElementClass()}
        style={{
          left: `${x}%`,
          animationDuration: `${speed}s`,
          animationPlayState: isFrozen ? 'paused' : 'running'
        }}
        onClick={handleClick}
      >
        {getElementContent()}
      </div>

      {showParticles && (
        <ParticleSystem
          x={elementPosition.x}
          y={elementPosition.y}
          type={type}
          onComplete={handleParticlesComplete}
        />
      )}
    </>
  );
};

export default GameElement;