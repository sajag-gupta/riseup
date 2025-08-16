# Rise Up Creators - Music Streaming Platform

A comprehensive full-stack music streaming and creator platform built with React, TypeScript, Express, and PostgreSQL. Features music streaming, creator dashboard, e-commerce, and social interactions.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- VS Code (recommended)

### Running Locally in VS Code

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd rise-up-creators
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create a PostgreSQL database and set environment variable
   export DATABASE_URL="postgresql://username:password@localhost:5432/your-database"
   
   # Or create a .env file with:
   # DATABASE_URL=postgresql://username:password@localhost:5432/your-database
   ```

3. **Push Database Schema**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5000`

### VS Code Extensions (Recommended)
- TypeScript Importer
- Tailwind CSS IntelliSense  
- ES7+ React/Redux Snippets
- Prettier - Code formatter

## 🎵 Features

### Music Streaming
- ✅ Full audio player with play/pause, volume, and seeking
- ✅ Sample tracks with working audio
- ✅ Track library and playlists
- ✅ Like/unlike functionality

### Creator Tools
- ✅ Upload and manage tracks
- ✅ Creator dashboard with analytics
- ✅ Merchandise sales
- ✅ Fan engagement tools

### Social Features
- ✅ Follow creators
- ✅ User profiles and bios
- ✅ Comments and likes
- ✅ Social sharing

### E-commerce
- ✅ Shopping cart
- ✅ Product catalog
- ✅ Creator merchandise
- 🔄 Payment processing (integration ready)

## 🏗️ Architecture

### Frontend (`/client`)
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for API state
- **shadcn/ui** components with Tailwind CSS
- **Functional music player** with HTML5 Audio API

### Backend (`/server`)
- **Express.js** with TypeScript
- **RESTful API** design
- **Session-based authentication**
- **In-memory storage** (development)

### Database
- **PostgreSQL** with Drizzle ORM
- **Comprehensive schema** for users, tracks, products
- **Migration support** via `npm run db:push`

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
```

## 🎧 Music Player Features

The platform includes a fully functional music player:

- **Real-time audio playback** with HTML5 Audio API
- **Progress tracking** and seeking
- **Volume control**
- **Track information display**
- **Sample tracks** included for testing

### Sample Tracks Included:
1. "Midnight Dreams" - Indie Pop (Sarah Chen)
2. "Electric Waves" - Electronic (DJ Neon) 
3. "Ocean Breeze" - Ambient (Sarah Chen)
4. "Digital Dreams" - Electronic (DJ Neon)

## 🔧 Development

### Project Structure
```
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   ├── context/    # React context (auth, player)
│   │   └── hooks/      # Custom hooks
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # Data storage layer
├── shared/             # Shared types and schemas
└── package.json        # Dependencies and scripts
```

### Adding New Features
1. Define types in `shared/schema.ts`
2. Update storage interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`  
4. Create UI components in `client/src/components/`
5. Update routes in `client/src/App.tsx`

## 🌐 Deployment

The app is ready for deployment on Replit or any Node.js hosting platform.

### Environment Variables
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=5000
```

## 📄 License

MIT License - feel free to use this project as a starting point for your own music platform!