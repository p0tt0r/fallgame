import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/localStorageService';
import './SimpleAuth.css';

interface SimpleAuthProps {
    onAuthSuccess: (user: any) => void;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ onAuthSuccess }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // Проверяем есть ли сохраненный пользователь
    useEffect(() => {
        const existingUser = storageService.getUser();
        if (existingUser) {
            onAuthSuccess(existingUser);
        }
    }, [onAuthSuccess]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setError('Введите имя пользователя');
            return;
        }

        if (trimmedUsername.length < 2) {
            setError('Имя должно быть至少 2 символа');
            return;
        }

        if (trimmedUsername.length > 20) {
            setError('Имя должно быть не длиннее 20 символов');
            return;
        }

        // Сохраняем пользователя
        const user = storageService.saveUser(trimmedUsername);
        onAuthSuccess(user);
    };

    return (
        <div className="simple-auth-overlay">
            <div className="simple-auth-form">
                <div className="auth-header">
                    <h1>🎮 FallGame</h1>
                    <p>Собирайте сердца, избегайте бомб!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label htmlFor="username">Ваше игровое имя:</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Введите имя..."
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            maxLength={20}
                            autoFocus
                        />
                        <div className="input-hint">От 2 до 20 символов</div>
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        Начать игру!
                    </button>
                </form>

                <div className="auth-features">
                    <div className="feature">
                        <span>🏆</span> Сохранение рекордов
                    </div>
                    <div className="feature">
                        <span>📊</span> Таблица лидеров
                    </div>
                    <div className="feature">
                        <span>💾</span> Локальное сохранение
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleAuth;