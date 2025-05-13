'use client';
import React, { useState, useEffect } from 'react';
import DesignerRenderer from './components/DesignerRenderer';
import { Template } from '@/app/types/template';

// Use require instead of import
const jason = require('@/public/templates/homelg.json');

const Home: React.FC = () => {
  const [template, setTemplate] = useState<Template | null>(jason);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rest of your component remains the same
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading template...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Template</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="error-container">
        <h2>Failed to Load Template</h2>
        <p>The template could not be loaded. Please check your configuration.</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <DesignerRenderer template={template} />
    </div>
  );
};

export default Home;
