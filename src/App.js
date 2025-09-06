import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import ConvertButton from './components/ConvertButton';
import Chatbot from './components/Chatbot';
import './App.css';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' }
];

function App() {
  const [code, setCode] = useState('// Welcome to Code Converter IDE\n// Write your code here and convert it to any language!\n\nfunction hello() {\n  console.log("Hello, World!");\n}');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [isConverting, setIsConverting] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleChatMessage = async (message) => {
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          currentCode: code,
          currentLanguage,
          targetLanguage,
          chatHistory: chatHistory.slice(-5) // Send last 5 messages for context
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add AI response to chat
        setChatHistory(prev => [...prev, {
          type: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          type: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleConvert = async () => {
    if (!code.trim()) {
      alert('Please enter some code to convert');
      return;
    }

    setIsConverting(true);
    
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          fromLanguage: currentLanguage,
          toLanguage: targetLanguage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCode(data.convertedCode);
        // Don't change currentLanguage to keep convert button available
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          type: 'conversion',
          from: currentLanguage,
          to: targetLanguage,
          originalCode: code,
          convertedCode: data.convertedCode,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        alert('Conversion failed: ' + data.error);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Failed to convert code. Please check your connection and try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Code Converter IDE</h1>
        <div className="language-controls">
          <LanguageSelector
            languages={SUPPORTED_LANGUAGES}
            selectedLanguage={currentLanguage}
            onChange={setCurrentLanguage}
            label="Current Language"
          />
          <ConvertButton 
            onClick={handleConvert}
            isConverting={isConverting}
            currentLanguage={currentLanguage}
            targetLanguage={targetLanguage}
          />
          <LanguageSelector
            languages={SUPPORTED_LANGUAGES}
            selectedLanguage={targetLanguage}
            onChange={setTargetLanguage}
            label="Convert To"
          />
        </div>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={currentLanguage}
          />
        </div>
        
        <div className="chat-section">
          <Chatbot
            chatHistory={chatHistory}
            onSendMessage={handleChatMessage}
            currentCode={code}
            currentLanguage={currentLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
