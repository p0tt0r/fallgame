import React, { useState, useEffect, useCallback } from 'react';
import GameElement from './GameElement';
import PauseButton from '../UI/PauseButton';
import SimpleAuth from '../Auth/SimpleAuth';
import { storageService, User } from '../../services/localStorageService';
import '../../styles/game.css';

type GameElementType = {
  id: number;
  x: number;
  speed: number;
  type: 'heart' | 'bomb' | 'freeze';
  createdAt: number;
};

const GameBoard: React.FC = () => {
  const [score, setScore] = useState(0);
  const [elements, setElements] = useState<GameElementType[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const savedUser = storageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setHighScore(savedUser.highScore);
      setShowAuth(false);
    }
  }, []);

  const createElement = useCallback((type: GameElementType['type']): GameElementType => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90,
      speed: Math.random() * 2 + 2,
      type,
      createdAt: Date.now()
    };
  }, []);

  const handleElementClick = (id: number, type: GameElementType['type']) => {
    if (isPaused) return;

    setElements(prev => prev.filter(el => el.id !== id));

    let newScore = score;

    switch (type) {
      case 'heart':
        newScore = score + 1;
        break;
      case 'bomb':
        newScore = Math.max(0, score - 10);
        break;
      case 'freeze':
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 2000);
        break;
    }

    setScore(newScore);

    if (newScore > highScore && user) {
      const updatedUser = storageService.updateUserScore(newScore);
      if (updatedUser) {
        setHighScore(newScore);
        setUser(updatedUser);


        storageService.updateLeaderboard(newScore);
      }
    }

  };





  const handlePauseClick = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    if (newPausedState) {
      setElements([]);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setHighScore(userData.highScore);
    setShowAuth(false);
  };

  const handleLogout = () => {
    storageService.clearAllData();
    setUser(null);
    setScore(0);
    setHighScore(0);
    setShowAuth(true);
    setElements([]);
  };

  const handleNewGame = () => {
    setScore(0);
    setElements([]);
    setIsPaused(false);
  };



  useEffect(() => {
    if (isPaused || showAuth) return;

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
  }, [isPaused, createElement, showAuth]);


  // удаление элементов
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setElements(prev => prev.filter(el => now - el.createdAt < 15000));
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, []);

  if (showAuth) {
    return <SimpleAuth onAuthSuccess={handleAuthSuccess} />;
  }


  return (
    <div className="game-container">
      {isFrozen && <div className="freeze-overlay"></div>}

      {/* Верхняя панель */}
      <div className="game-header">
        <div className="user-panel">
          <div className="user-info">
            <span className="username">👤 {user?.username}</span>
            <div className="user-stats">
              <span>🏆 {highScore}</span>
              <span>🎮 {user?.gamesPlayed || 0}</span>
            </div>
          </div>
          <div className="user-actions">
            <button onClick={handleNewGame} className="icon-btn" title="Новая игра">
              🔄
            </button>
            <button onClick={() => setShowLeaderboard(true)} className="icon-btn" title="Таблица лидеров">
              📊
            </button>
            <button onClick={handleLogout} className="icon-btn" title="Выйти">
              🚪
            </button>
          </div>
        </div>

        <div className="score-panel">
          <div className="current-score">Score: {score}</div>
          {score > highScore && <div className="new-record">🔥 Новый рекорд!</div>}
        </div>
      </div>

      <PauseButton isPaused={isPaused} onClick={handlePauseClick} />

      {/* Таблица лидеров */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {isPaused && (
        <div className="pause-notification">
          ⏸️ PAUSED
          <div className="pause-hint">Нажмите play чтобы продолжить</div>
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

// Компонент таблицы лидеров
const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const leaderboard = storageService.getLeaderboard();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Таблица лидеров</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="no-scores">Пока нет результатов</div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.userId + entry.date} className="leaderboard-item">
                <div className="rank">#{index + 1}</div>
                <div className="player-info">
                  <span className="player-name">{entry.username}</span>
                  <span className="score-date">{entry.date}</span>
                </div>
                <div className="player-score">{entry.score} pts</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;