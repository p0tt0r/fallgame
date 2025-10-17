import React from 'react';
import { storageService } from '../../services/localStorageService';

interface LeaderboardModalProps {
    onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
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

export default LeaderboardModal;