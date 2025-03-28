# AI Incidents 3D Visualization

An interactive 3D visualization of the AI Incident Database, showcasing AI safety incidents in an immersive and explorable environment.

## Features

- Interactive 3D visualization using Three.js
- Multiple visualization modes:
  - Network View: Connects incidents to their types
  - Timeline View: Arranges incidents by year
  - Severity View: Organizes incidents by severity level
  - Entity View: Shows relationships between organizations and incidents
- Hover tooltips for quick information
- Detailed incident information on click
- Rotate, zoom, and explore the 3D space

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/ai-safety-vis.git
cd ai-safety-vis
```

2. Install dependencies
```bash
npm install
```

3. Process the data from the AI Incident Database
```bash
node scripts/convert-data.js
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for easy deployment to Netlify:

1. Push your repository to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically deploy your site using the settings in `netlify.toml`

## Data Source

This visualization uses data from the [AI Incident Database](https://incidentdatabase.ai/), which collects, categorizes, and makes available reports of AI system failures, issues, and problems.

## Technologies Used

- React
- Next.js
- Three.js
- React Three Fiber
- D3.js (for data processing)
- Netlify (for deployment)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The AI Incident Database for providing the structured data
- The Three.js community for excellent documentation and examples