import React from 'react';
import { Element } from '../../types/template';

interface VideoElementProps {
  element: Element;
}

const VideoElement: React.FC<VideoElementProps> = ({ element }) => {
  const { src, style } = element;
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }}>
      <video 
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style.objectFit as 'cover' | 'contain' | 'fill' | 'none' || 'cover',
          borderRadius: `${style.borderRadius}px`,
        }}
        controls={false}
        muted
        loop
      />
    </div>
  );
};

export default VideoElement;