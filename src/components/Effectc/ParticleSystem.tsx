import React, { useEffect, useState } from 'react';
import './ParticleSystem.css';

interface Particle {
    id: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
    color: string;
}

interface ParticleSystemProps {
    x: number;
    y: number;
    onComplete: () => void;
    type: 'bomb' | 'heart' | 'freeze';
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ x, y, onComplete, type }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Создаем частицы в зависимости от типа элемента
        const newParticles: Particle[] = [];
        const particleCount = type === 'bomb' ? 12 : 8;
        const colors = getParticleColors(type);

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.8 + Math.random() * 0.4;

            newParticles.push({
                id: i,
                x,
                y,
                tx: Math.cos(angle) * speed,
                ty: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        setParticles(newParticles);

        // Удаляем компонент после завершения анимации
        const timer = setTimeout(() => {
            onComplete();
        }, 800);

        return () => clearTimeout(timer);
    }, [x, y, onComplete, type]);

    const getParticleColors = (type: string): string[] => {
        switch (type) {
            case 'bomb':
                return ['#FF4444', '#FF6B6B', '#FFE66D', '#FFA726', '#FF9800'];
            case 'heart':
                return ['#FF6B8B', '#FF8FA3', '#FFB3C6', '#FFCCD5'];
            case 'freeze':
                return ['#4ECDC4', '#6FFFE9', '#9EFCF7', '#C7FDF7'];
            default:
                return ['#FFFFFF'];
        }
    };

    return (
        <div className="particles-container">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        '--tx': particle.tx,
                        '--ty': particle.ty,
                        background: particle.color,
                        width: type === 'bomb' ? '10px' : '6px',
                        height: type === 'bomb' ? '10px' : '6px'
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

export default ParticleSystem;