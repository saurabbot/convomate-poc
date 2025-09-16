# Convomate - AI-Powered Content Analysis Platform

A modern, highly scalable Next.js application for processing URLs, extracting content, and enabling AI-powered conversations about the analyzed data.

## Features

- **URL Processing**: Extract and analyze content from any URL
- **AI Agent Integration**: Real-time video conferencing with AI agents
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Type Safety**: Full TypeScript implementation
- **Performance Optimized**: Built with modern web standards and best practices
- **Error Handling**: Comprehensive error boundaries and fallback UI
- **Accessibility**: WCAG compliant design patterns

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API**: Next.js API Routes
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs_poc
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── url/process/   # URL processing endpoint
│   ├── agent-room/        # Video conferencing pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── loading.tsx       # Global loading UI
│   ├── error.tsx         # Global error UI
│   └── not-found.tsx     # 404 page
├── components/            # Reusable components
│   ├── ConvomateLogo.tsx # Brand logo component
│   ├── ErrorBoundary.tsx # Error handling
│   └── LoadingSpinner.tsx # Loading states
└── utils/                # Utility functions
    └── roomUtils.ts      # Room ID generation
```

## API Endpoints

### POST /api/url/process

Processes a URL and extracts metadata.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "domain": "example.com",
    "title": "Content from example.com",
    "description": "URL processed successfully"
  }
}
```

## Features in Detail

### URL Processing
- Validates URL format
- Extracts domain information
- Provides real-time feedback
- Error handling for invalid/unreachable URLs

### Agent Room
- Dynamic room ID generation
- Video/audio controls simulation
- Real-time chat interface
- Responsive design for all devices

### Performance Optimizations
- Image optimization with WebP/AVIF support
- Component lazy loading
- Bundle size optimization
- SEO-friendly metadata

### Security
- CSP headers
- XSS protection
- CSRF protection
- Secure headers configuration

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env.local` file for local development:

```env
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

This application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

For other platforms, build the application:

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.