import React, { useEffect, useRef } from 'react';
import { OpenEdit } from 'open-edit';
import type { EditorInterface, EditorOptions } from 'open-edit';

interface OpenEditReactProps extends Omit<EditorOptions, 'element'> {
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * OpenEdit React Component
 * 
 * A functional component wrapper for the OpenEdit WYSIWYG editor.
 * Handles initialization, cleanup, and value synchronization.
 */
export const OpenEditReact: React.FC<OpenEditReactProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  theme = 'auto',
  className,
  style,
  ...restOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorInterface | null>(null);

  // 1. Initialize Editor on Mount
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    editorRef.current = OpenEdit.create(containerRef.current, {
      content: value,
      placeholder,
      theme,
      onChange: (html) => {
        if (onChange) {
          onChange(html);
        }
      },
      ...restOptions,
    });

    // 2. Cleanup on Unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures initialization runs only once

  // 3. Synchronize external value updates
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getHTML()) {
      editorRef.current.setHTML(value);
    }
  }, [value]);

  return (
    <div 
      ref={containerRef} 
      className={`openedit-react-wrapper ${className || ''}`}
      style={{ 
        minHeight: '150px', 
        border: '1px solid var(--oe-border, #e2e8f0)', 
        borderRadius: 'var(--oe-radius, 8px)',
        ...style 
      }}
    />
  );
};

// === USAGE EXAMPLE ===
/*
import React, { useState } from 'react';
import { OpenEditReact } from './ReactExample';

export const App = () => {
  const [content, setContent] = useState('<p>Hello from <strong>React</strong>!</p>');

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>My Editor</h2>
      <OpenEditReact 
        value={content} 
        onChange={setContent} 
        theme="auto"
        placeholder="Share your thoughts..."
      />
      
      <h4 style={{ marginTop: '20px' }}>Live HTML Output:</h4>
      <pre style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', overflowX: 'auto' }}>
        {content}
      </pre>
    </div>
  );
};
*/
