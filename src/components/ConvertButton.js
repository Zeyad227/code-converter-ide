import React from 'react';
import './ConvertButton.css';

const ConvertButton = ({ onClick, isConverting, currentLanguage, targetLanguage }) => {
  return (
    <button 
      className={`convert-button ${isConverting ? 'converting' : ''}`}
      onClick={onClick}
      disabled={isConverting || currentLanguage === targetLanguage}
    >
      {isConverting ? (
        <>
          <span className="spinner"></span>
          Converting...
        </>
      ) : (
        <>
          <span className="arrow">→</span>
          Convert
        </>
      )}
    </button>
  );
};

export default ConvertButton;
