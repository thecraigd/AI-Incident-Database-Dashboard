import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import visualization components with SSR disabled
const MinimalViz = dynamic(
  () => import('../components/MinimalViz'),
  { ssr: false }
);

export default function TestPage() {
  return (
    <div className="container">
      <Head>
        <title>Three.js Test Page</title>
        <meta name="description" content="Testing Three.js visualizations" />
      </Head>

      <main>
        <h1>Three.js Test Page</h1>
        <p>This page tests if Three.js visualizations work in your browser.</p>
        
        <div className="test-section">
          <h2>Minimal Three.js Test</h2>
          <p>A minimal Three.js visualization with a rotating wireframe cube:</p>
          <MinimalViz />
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background-color: #f0f0f0;
        }
        
        main {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .test-section {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #444;
        }
      `}</style>
    </div>
  );
}