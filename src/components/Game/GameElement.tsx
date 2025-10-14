import React, { useState, useEffect } from 'react';

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
  const [isDestroyed, setIsDestroyed] = useState(false);

  // Проверяем позицию элемента
  useEffect(() => {
    const checkPosition = () => {
      const element = document.getElementById(`element-${id}`);
      if (!element) return;

      const rect = element.getBoundingClientRect();

      // Если элемент достиг нижней границы
      if (rect.top >= window.innerHeight && !isDestroyed) {
        setIsDestroyed(true);

        // Запускаем анимацию уничтожения
        setTimeout(() => {
          const elementToRemove = document.getElementById(`element-${id}`);
          if (elementToRemove) {
            elementToRemove.remove();
          }
        }, 300); // Время анимации
      }
    };

    const interval = setInterval(checkPosition, 100);
    return () => clearInterval(interval);
  }, [id, isDestroyed]);

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
    const destroyedClass = isDestroyed ? 'element-destroyed' : '';

    return `${baseClass} ${typeClass} ${frozenClass} ${destroyedClass}`;
  };

  return (
    <div
      id={`element-${id}`}
      className={getClassName()}
      style={{
        left: `${x}vw`,
        animation: `fall-slow ${speed}s linear forwards`,
        animationPlayState: isFrozen ? 'paused' : 'running'
      }}
      onClick={onClick}
    >
      {getEmoji()}
    </div>
  );
};

export default GameElement;