import React from 'react';
import { Section } from '../types/template';
import CanvasRenderer from './CanvasRenderer';

interface SectionRendererProps {
  sectionKey: string;
  section: Section;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sectionKey, section }) => {
  // Handle nested sections (children)
  if (sectionKey === 'children' && section?.sections && section.order) {
    return (
      <div className="nested-sections">
        {section.order.map((childType) => {
          const childSection = section.sections?.find(s => s.type === childType);
          if (childSection) {
            return (
              <SectionRenderer 
                key={childType} 
                sectionKey={childType} 
                section={childSection} 
              />
            );
          }
          return null;
        })}
      </div>
    );
  }

  // Regular section rendering
  const { type, settings, blocks } = section;
  
  const sectionStyle: React.CSSProperties = {
    paddingTop: `${settings.paddingTop}px`,
    paddingBottom: `${settings.paddingBottom}px`,
    paddingLeft: `${settings.paddingLeft}px`,
    paddingRight: `${settings.paddingRight}px`,
    marginTop: settings.marginTop ? `${settings.marginTop}px` : undefined,
    marginBottom: settings.marginBottom ? `${settings.marginBottom}px` : undefined,
    backgroundColor: settings.backgroundColor,
  };
  
  return (
    <section 
      className={`section section-${type}`} 
      data-section-type={type}
      style={sectionStyle}
    >
      {blocks && <CanvasRenderer blocks={blocks} />}
    </section>
  );
};

export default SectionRenderer;