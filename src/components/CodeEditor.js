import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import './CodeEditor.css';

const LANGUAGE_EXTENSIONS = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
  csharp: javascript(), // Use JS highlighting for C#
  go: javascript(), // Use JS highlighting for Go
  rust: javascript() // Use JS highlighting for Rust
};

const CodeEditor = ({ code, onChange, language }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        oneDark,
        LANGUAGE_EXTENSIONS[language] || javascript(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '100%'
          },
          '.cm-focused': {
            outline: 'none'
          },
          '.cm-editor': {
            height: '100%'
          },
          '.cm-scroller': {
            height: '100%'
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== code) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code
        }
      });
    }
  }, [code]);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="file-indicator">
          {language}.{getFileExtension(language)}
        </span>
      </div>
      <div className="editor-container" ref={editorRef} />
    </div>
  );
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    rust: 'rs'
  };
  return extensions[language] || 'txt';
};

export default CodeEditor;
