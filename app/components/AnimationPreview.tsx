import React, { useState, useEffect } from 'react';
import { Element } from '../types/template';
import { getAnimationClasses } from '../utils/animationUtils';

interface AnimationPreviewProps {
  element: Element;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ element }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Get animation classes
  const animationClasses = getAnimationClasses(element);
  
  // Reset animation when element changes
  useEffect(() => {
    setAnimationComplete(false);
    setIsPlaying(false);
  }, [element.animation]);
  
  // Handle animation completion
  useEffect(() => {
    if (isPlaying && element.animation?.entrance && element.animation.entrance.type !== 'none') {
      const duration = element.animation.entrance.duration || 1000;
      const delay = element.animation.entrance.delay || 0;
      
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, duration + delay + 100);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, element.animation]);
  
  // Play animation
  const playAnimation = () => {
    setAnimationComplete(false);
    setIsPlaying(true);
  };
  
  // Generate preview style based on element style
  const previewStyle: React.CSSProperties = {
    width: '100%',
    height: '100px',
    backgroundColor: element.style.backgroundColor,
    color: element.style.color,
    borderRadius: `${element.style.borderRadius}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${element.style.fontSize}px`,
    fontWeight: element.style.fontWeight as any,
    border: element.style.borderWidth && element.style.borderStyle !== 'none' 
      ? `${element.style.borderWidth}px ${element.style.borderStyle} ${element.style.borderColor}` 
      : 'none',
    boxShadow: element.style.boxShadowBlur || element.style.boxShadowSpread 
      ? `0 0 ${element.style.boxShadowBlur || 0}px ${element.style.boxShadowSpread || 0}px ${element.style.boxShadowColor || 'rgba(0,0,0,0.2)'}` 
      : 'none',
    opacity: element.style.opacity !== undefined ? element.style.opacity : 1,
    transform: element.style.rotate 
      ? `rotate(${element.style.rotate}deg)` 
      : element.style.scale && element.style.scale !== 1 
        ? `scale(${element.style.scale})` 
        : 'none',
    transition: 'all 0.3s ease',
  };
  
  const previewClasses = `animation-preview-element ${isPlaying ? animationClasses : ''} ${animationComplete ? 'animation-complete' : ''}`;
  
  return (
    <div className="animation-preview-container">
      <div className="animation-preview-controls">
        <button 
          className="play-button"
          onClick={playAnimation}
          disabled={isPlaying && !animationComplete}
        >
          {isPlaying && !animationComplete ? 'Playing...' : 'Play Animation'}
        </button>
      </div>
      
      <div className="animation-preview-stage">
        <div 
          className={previewClasses}
          style={previewStyle}
        >
          {element.type === 'button' || element.type === 'heading' || element.type === 'paragraph' 
            ? element.content || element.type 
            : element.type}
        </div>
      </div>
      
      <style jsx>{`
        .animation-preview-container {
          margin-top: 12px;
        }
        
        .animation-preview-controls {
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
        }
        
        .play-button {
          padding: 8px 16px;
          background-color: #0d6efd;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s;
        }
        
        .play-button:hover:not(:disabled) {
          background-color: #0b5ed7;
        }
        
        .play-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .animation-preview-stage {
          height: 150px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
        }
        
        .animation-preview-element {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default AnimationPreview;
