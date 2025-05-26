'use client';

import { useState, useEffect } from 'react';
import DesignerRenderer from './components/DesignerRenderer';
import { Template } from './types/template';

export default function Home() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/templates/homelg.json');
        const templateData = await response.json();
        setTemplate(templateData);
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, []);

  const handleTemplateUpdate = (updatedTemplate: Template) => {
    setTemplate(updatedTemplate);
    // Here you could also save to localStorage, send to API, etc.
    console.log('Template updated:', updatedTemplate);
  };

  if (loading) {
    return <div>Loading template...</div>;
  }

  if (!template) {
    return <div>Failed to load template</div>;
  }

  return (
    <main>
      <DesignerRenderer 
        template={template} 
        onTemplateUpdate={handleTemplateUpdate}
      />
    </main>
  );
}
