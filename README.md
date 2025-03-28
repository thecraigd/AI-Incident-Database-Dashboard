# AI Safety Incidents Dashboard

A beautiful, state-of-the-art data visualization dashboard showcasing trends and patterns in AI safety incidents from the AI Incident Database.

## Features

- Interactive visualizations of AI safety incidents over time
- Detailed breakdown of incidents by entity, sector, severity, and geographic region
- Advanced filtering by clicking directly on visualizations
- Interactive search capabilities for all incident data
- Responsive design for all device sizes
- Detailed information about each incident with direct links to the AI Incident Database
- Integration with original incident reports and sources

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for deployment to Netlify.

1. Create a new GitHub repository and push the code
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

Netlify will automatically build and deploy your site.

## Data Sources

The data used in this dashboard comes from the AI Incident Database (as of March 24, 2025), specifically the MongoDB full snapshot provided in the `mongodump_full_snapshot` directory. The main data files used are:

- `incidents.csv`: Contains the main incident data
- `reports.csv`: Contains reports related to each incident
- `classifications_CSETv1.csv`: Contains classification information for incidents

The dashboard includes data processing that:
- Automatically categorizes incidents by sector based on text analysis
- Identifies geographic regions mentioned in incident descriptions
- Creates relationships between incidents, entities, and reports

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Framer Motion for animations
- Lucide React for icons
- Lodash for data manipulation
- CSV Parser for data processing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by the [AI Incident Database](https://incidentdatabase.ai/)