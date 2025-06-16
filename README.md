# TruthGuard Frontend

A Next.js-based frontend application for analyzing media bias, misinformation, and credibility in news articles using AI and real-time data analysis.

## Features

- **Real-time News Analysis**: Monitor and analyze news articles as they're published
- **AI-Powered Insights**: Advanced analysis of media bias and credibility using Google AI
- **MongoDB Integration**: Vector search and analytics for efficient data querying
- **Interactive Visualizations**: Rich data visualization components for bias analysis
- **Responsive Design**: Full mobile and desktop support using Tailwind CSS

## Tech Stack

- **Frontend Framework**: Next.js 14+
- **UI Components**: Tailwind CSS + Shadcn/ui
- **Data Visualization**: Custom charting components
- **State Management**: React hooks
- **API Integration**: REST APIs with built-in Next.js API routes
- **Database**: MongoDB with Vector Search capabilities
- **AI/ML**: Google AI integration for content analysis

## Project Structure

```
app/                  # Next.js app directory
├── api/             # API routes
├── dashboard/       # Dashboard page
├── analyze/         # Article analysis page
├── trends/         # Trends analysis page
└── ...other pages

components/          # Reusable React components
├── ui/             # Base UI components
└── ...analysis components

lib/                # Utility functions and API clients
hooks/              # Custom React hooks
styles/             # Global styles
public/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB instance with Vector Search enabled

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd TruthGuard_Frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

### Environment Variables

Required environment variables:

- `MONGODB_URI`: MongoDB connection string
- `GOOGLE_AI_API_KEY`: Google AI API key
- `NEWS_API_KEY`: News API key for article fetching
- `BACKEND_BASE_URL`: URL of the TruthGuard backend service

## Docker Support

Build the container:
```bash
docker build -t truthguard-frontend .
```

Run with Docker:
```bash
docker run -p 3000:3000 truthguard-frontend
```

Or use Docker Compose:
```bash
docker-compose up
```

## Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement responsive design patterns
- Write clean, documented code

### Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Production Deployment

The application is configured for deployment on Google Cloud Run:

```bash
gcloud builds submit
```

Or deploy to your preferred hosting platform using the provided Dockerfile.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database by [MongoDB](https://www.mongodb.com/)
- AI capabilities powered by [Google AI](https://ai.google.dev/)
