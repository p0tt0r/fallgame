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

  const createElement = useCallback((type: GameElementType['type']): GameElementType => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90,
      speed: Math.random() * 2 + 2,
      type
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

    // Если включаем паузу - очищаем экран
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

  // АВТОМАТИЧЕСКОЕ УДАЛЕНИЕ ПРИ ДОСТИЖЕНИИ НИЖНЕЙ ГРАНИЦЫ
  useEffect(() => {
    const checkElementsPosition = () => {
      setElements(prev => prev.filter(el => {
        const element = document.getElementById(`element-${el.id}`);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        // Удаляем если элемент достиг нижней границы экрана
        return rect.top < window.innerHeight;
      }));
    };

    const positionCheckInterval = setInterval(checkElementsPosition, 100); // Проверяем чаще

    // Также проверяем позицию при скролле/изменении размера
    window.addEventListener('resize', checkElementsPosition);

    return () => {
      clearInterval(positionCheckInterval);
      window.removeEventListener('resize', checkElementsPosition);
    };
  }, []);

  // УДАЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ВЫХОДЕ ЗА ПРЕДЕЛЫ ЭКРАНА (страховка)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setElements(prev => prev.filter(el => {
        const element = document.getElementById(`element-${el.id}`);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        // Удаляем если элемент полностью ушел за нижнюю границу
        return rect.top < window.innerHeight + 100;
      }));
    }, 1000);

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
        onClick={handlePauseClick}
      />

      {/* Сообщение о паузе */}
      {isPaused && (
        <div className="pause-notification">
          ⏸️ PAUSED
          <div className="pause-hint">Click play to continue</div>
        </div>
      )}

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