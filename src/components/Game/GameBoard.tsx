import React, { useState, useEffect, useCallback } from 'react';
import GameElement from './GameElement';
import PauseButton from '../UI/PauseButton';
import '../../styles/game.css';

type GameElementType = {
  id: number;
  x: number;
  speed: number;
  type: 'heart' | 'bomb' | 'freeze';
};

const GameBoard: React.FC = () => {
  const [score, setScore] = useState(0);
  const [elements, setElements] = useState<GameElementType[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // ЗАМЕДЛЕНИЕ: увеличиваем интервалы создания элементов
  const createElement = useCallback((type: GameElementType['type']): GameElementType => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90,
      speed: Math.random() * 2 + 2, // Увеличиваем минимальную скорость
      type
    };
  }, []);

  // Обработка клика по элементу (теперь работает при заморозке)
  const handleElementClick = (id: number, type: GameElementType['type']) => {
    // УБИРАЕМ ПРОВЕРКУ isFrozen - элементы кликабельны всегда!
    if (isPaused) return;

    setElements(prev => prev.filter(el => el.id !== id));

    switch (type) {
      case 'heart':
        setScore(s => s + 1);
        break;
      case 'bomb':
        setScore(s => Math.max(0, s - 10));
        break;
      case 'freeze':
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 2000);
        break;
    }
  };

  // ЗАМЕДЛЕНИЕ: увеличиваем интервалы генерации
  useEffect(() => {
    if (isPaused) return;

    const intervals = {
      heart: setInterval(() => {
        setElements(prev => [...prev, createElement('heart')]);
      }, 1200), // Было 800 - стало 1200

      bomb: setInterval(() => {
        setElements(prev => [...prev, createElement('bomb')]);
      }, 5000), // Было 3000 - стало 5000

      freeze: setInterval(() => {
        setElements(prev => [...prev, createElement('freeze')]);
      }, 15000) // Было 10000 - стало 15000
    };

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [isPaused, createElement]);

  // АВТОМАТИЧЕСКОЕ УДАЛЕНИЕ ЭЛЕМЕНТОВ
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setElements(prev => prev.filter(el => {
        const element = document.getElementById(`element-${el.id}`);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        // Удаляем если элемент ниже видимой области
        return rect.top < window.innerHeight + 100;
      }));
    }, 2000); // Проверяем каждые 2 секунды

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="game-container">
      {/* СИНИЙ ЭКРАН ЗАМОРОЗКИ */}
      {isFrozen && <div className="freeze-overlay"></div>}

      {/* Панель управления */}
      <div className="score">Score: {score}</div>
      <PauseButton
        isPaused={isPaused}
        onClick={() => setIsPaused(!isPaused)}
      />

      {/* Рендер элементов */}
      {elements.map(el => (
        <GameElement
          key={el.id}
          id={el.id}
          type={el.type}
          x={el.x}
          speed={el.speed}
          onClick={() => handleElementClick(el.id, el.type)}
          isFrozen={isFrozen}
        />
      ))}
    </div>
  );
};

export default GameBoard;