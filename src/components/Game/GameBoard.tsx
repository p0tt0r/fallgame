import React, { useState, useEffect, useCallback } from 'react';
import GameElement from './GameElement';
import PauseButton from '../UI/PauseButton';
import '../../styles/game.css';

type GameElementType = {
  id: number;
  x: number;
  speed: number;
  type: 'heart' | 'bomb' | 'freeze';
  createdAt: number; // Добавляем время создания
};

const GameBoard: React.FC = () => {
  const [score, setScore] = useState(0);
  const [elements, setElements] = useState<GameElementType[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const createElement = useCallback((type: GameElementType['type']): GameElementType => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90,
      speed: Math.random() * 2 + 2,
      type,
      createdAt: Date.now() // Запоминаем время создания
    };
  }, []);

  const handleElementClick = (id: number, type: GameElementType['type']) => {
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

  // ОЧИСТКА ЭКРАНА ПРИ ПАУЗЕ
  const handlePauseClick = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    if (newPausedState) {
      setElements([]);
    }
  };

  // Генерация элементов
  useEffect(() => {
    if (isPaused) return;

    const intervals = {
      heart: setInterval(() => {
        setElements(prev => [...prev, createElement('heart')]);
      }, 1200),

      bomb: setInterval(() => {
        setElements(prev => [...prev, createElement('bomb')]);
      }, 5000),

      freeze: setInterval(() => {
        setElements(prev => [...prev, createElement('freeze')]);
      }, 15000)
    };

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [isPaused, createElement]);

  // ПРОСТАЯ И НАДЕЖНАЯ ЛОГИКА УДАЛЕНИЯ ПО ВРЕМЕНИ
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setElements(prev => prev.filter(el => {
        // Удаляем элементы, которые существуют дольше 8 секунд
        // (максимальное время падения + запас)
        return now - el.createdAt < 8000;
      }));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="game-container">
      {isFrozen && <div className="freeze-overlay"></div>}

      <div className="score">Score: {score}</div>
      <PauseButton
        isPaused={isPaused}
        onClick={handlePauseClick}
      />

      {isPaused && (
        <div className="pause-notification">
          ⏸️ PAUSED
          <div className="pause-hint">Click play to continue</div>
        </div>
      )}

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