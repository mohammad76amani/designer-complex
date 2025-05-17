import React from 'react';
import { Element } from '../../types/template';

interface VideoElementProps {
  element: Element;
}

const VideoElement: React.FC<VideoElementProps> = ({ element }) => {
  const { videoSrc, autoplay, loop, muted, controls } = element;
  
  return (
    <video
      src={videoSrc}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      style={{
        width: '100%',
        height: '100%',
        objectFit: element.style.objectFit as 'cover' | 'contain' | 'fill' | 'none' || 'cover',
        borderRadius: `${element.style.borderRadius}px`,
        pointerEvents: 'none',
      }}
    />
  );
};

export default VideoElement;