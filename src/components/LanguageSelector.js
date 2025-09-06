import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ languages, selectedLanguage, onChange, label }) => {
  return (
    <div className="language-selector">
      <label className="selector-label">{label}</label>
      <select 
        value={selectedLanguage} 
        onChange={(e) => onChange(e.target.value)}
        className="language-select"
      >
        {languages.map(lang => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
