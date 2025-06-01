import React from 'react';
import { Element } from '../../types/template';

const VideoElement: React.FC<{ element: Element }> = ({ element }) => {
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
        controls={element.controls}
        muted={element.muted}
        loop={element.loop}
        autoPlay={ element.autoplay}
      />
    </div>
  );
};

export default VideoElement;