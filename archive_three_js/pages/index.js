import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the visualization components with SSR disabled
const IncidentVisualization = dynamic(
  () => import('../components/IncidentVisualization'),
  { ssr: false }
);

const SimpleVisualization = dynamic(
  () => import('../components/SimpleVisualization'),
  { ssr: false }
);

export default function Home() {
  const [incidentsData, setIncidentsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching data...');
        const [incidentsRes, statisticsRes] = await Promise.all([
          fetch('/data/incidents.json'),
          fetch('/data/statistics.json')
        ]);

        if (!incidentsRes.ok) {
          throw new Error(`Failed to fetch incidents: ${incidentsRes.status} ${incidentsRes.statusText}`);
        }
        if (!statisticsRes.ok) {
          throw new Error(`Failed to fetch statistics: ${statisticsRes.status} ${statisticsRes.statusText}`);
        }

        const incidents = await incidentsRes.json();
        const statistics = await statisticsRes.json();
        
        console.log('Incidents data loaded:', incidents.length, 'items');
        console.log('Statistics loaded:', Object.keys(statistics));

        setIncidentsData({
          incidents,
          statistics
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>AI Incidents 3D Visualization</title>
        <meta name="description" content="Interactive 3D visualization of AI incidents from the AI Incident Database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className="header">
          <h1>AI Incidents 3D Explorer</h1>
          <p>An interactive 3D visualization of the AI Incident Database</p>
        </header>

        <div className="visualization-section">
          <h2>Simple Test Visualization</h2>
          <p className="description">This is a simple Three.js test to check if your browser supports WebGL rendering:</p>
          <SimpleVisualization />
        </div>
        
        <div className="visualization-section">
          <h2>AI Incidents Visualization</h2>
          <p className="description">This is the main visualization of AI incidents data:</p>
          
          {loading ? (
            <div className="loading">
              <p>Loading incident data...</p>
            </div>
          ) : (
            <>
              {incidentsData ? (
                <IncidentVisualization 
                  incidents={incidentsData.incidents} 
                  statistics={incidentsData.statistics}
                />
              ) : (
                <div className="error">
                  <p>Failed to load incident data. Please try again later.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer>
        <p>
          Based on data from the{' '}
          <a href="https://incidentdatabase.ai/" target="_blank" rel="noopener noreferrer">
            AI Incident Database
          </a>
        </p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f0f5ff;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .visualization-section {
          margin-bottom: 3rem;
        }
        
        .visualization-section h2 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .description {
          margin-bottom: 1rem;
          color: #666;
        }
        
        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 500px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        footer {
          padding: 2rem;
          text-align: center;
          border-top: 1px solid #eaeaea;
        }
        
        footer a {
          color: #0070f3;
          text-decoration: none;
        }
        
        footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}