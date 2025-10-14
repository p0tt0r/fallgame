import React from 'react';

interface PauseButtonProps {
  isPaused: boolean;
  onClick: () => void;
}

const PauseButton: React.FC<PauseButtonProps> = ({ isPaused, onClick }) => {
  return (
    <button className="pause-btn" onClick={onClick}>
      {isPaused ? '▶️' : '⏸️'}
    </button>
  );
};

export default PauseButton;
