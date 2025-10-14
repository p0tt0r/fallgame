import React, { useState, useEffect, useCallback } from 'react';
import GameElement from './GameElement';
import PauseButton from '../UI/PauseButton';
import '../../styles/game.css';

// Тип для падающих элементов
type GameElementType = {
  id: number;
  x: number; 
  speed: number; 
  type: 'heart' | 'bomb' | 'freeze'; 
};

const GameBoard: React.FC = () => {
  // Состояния игры
  const [score, setScore] = useState(0);
  const [elements, setElements] = useState<GameElementType[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  // Создание нового элемента
  const createElement = useCallback((type: GameElementType['type']): GameElementType => {
    return {
      id: Date.now() + Math.random(), // Уникальный ID
      x: Math.random() * 90, // Случайная позиция (0-90%)
      speed: Math.random() * 2 + 1, // Случайная скорость
      type // Тип элемента
    };
  }, []);

  // Обработка клика по элементу
  const handleElementClick = (id: number, type: GameElementType['type']) => {
    if (isPaused || isFrozen) return;

    setElements(prev => prev.filter(el => el.id !== id));

    switch(type) {
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

  // Генерация элементов
  useEffect(() => {
    if (isPaused) return;

    const intervals = {
      heart: setInterval(() => {
        setElements(prev => [...prev, createElement('heart')]);
      }, 800),
      
      bomb: setInterval(() => {
        setElements(prev => [...prev, createElement('bomb')]);
      }, 3000),
      
      freeze: setInterval(() => {
        setElements(prev => [...prev, createElement('freeze')]);
      }, 10000)
    };

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [isPaused, createElement]);

  // Очистка ушедших за экран элементов
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setElements(prev => prev.filter(el => {
        const element = document.getElementById(`element-${el.id}`);
        return element && element.getBoundingClientRect().top < window.innerHeight;
      }));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="game-container">
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
      
      {/* Эффект заморозки */}
      {isFrozen && <div className="frozen-overlay"></div>}
    </div>
  );
};

export default GameBoard;
