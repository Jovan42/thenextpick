# TheNextPick

A flexible platform designed for groups to democratically decide on and participate in shared activities. The project begins with a focused MVP and evolves into a versatile, multi-purpose platform.

## 🎯 Phase 1: MVP (Current Implementation)

TheNextPick MVP is a "Book Club" application that validates the core decision-making loop and tracks group activity over time. It operates on an "honor system" without user logins.

### ✨ Features

- **Democratic Voting System**: Members suggest 3 items, then vote using a 3-2-1 point system
- **Round Management**: Complete workflow from suggestions → voting → completion → history
- **Live Score Tracking**: Real-time vote tallies during voting phase
- **Completion Tracking**: Members can mark items as completed
- **History Log**: Permanent record of all past winning items
- **Responsive UI**: Modern, intuitive interface with clear visual feedback

### 🏗️ Architecture

**Backend**: Go (Golang)
- REST API using `net/http` and Chi router
- In-memory state management with JSON persistence
- CORS enabled for frontend integration

**Frontend**: React with Next.js
- TypeScript for type safety
- Component-based architecture
- Real-time state synchronization

**Data Persistence**: Single `data.json` file
- Automatic state saving after every change
- Persistent across server restarts

### 🚀 Quick Start

#### Backend (Go API)
```bash
cd apps/api
go mod tidy
go run .
```
Server runs on `http://localhost:8080`

#### Frontend (React)
```bash
cd apps/web
npm install
npm run dev
```
App runs on `http://localhost:3000`

### ⚙️ Configuration

The application uses a flexible configuration system that allows easy switching between local development and production environments.

#### Configuration Files
- **`apps/web/public/config.json`** - Local development configuration
- **`apps/web/public/config.production.json`** - Production configuration template

#### Key Configuration Options
```json
{
  "api": {
    "baseUrl": "http://localhost:8080"  // or "https://thenextpick-api.onrender.com"
  },
  "suggestions": {
    "minCount": 3,
    "maxCount": 5,
    "defaultCount": 4
  },
  "voting": {
    "pointSystem": {
      "enabled": true,
      "points": [3, 2, 1]
    }
  }
}
```

#### Switching Environments
- **Local Development**: Use `config.json` with `localhost:8080`
- **Production**: Copy `config.production.json` to `config.json` before deployment
- **Custom**: Modify the `baseUrl` in `config.json` to point to your API server

### 📊 API Endpoints

- `GET /api/state` - Get current application state
- `POST /api/suggest` - Submit 3 suggestions for voting
- `POST /api/vote` - Submit member's vote rankings
- `POST /api/round/close-voting` - Close voting and calculate winner
- `POST /api/completion-status` - Toggle member's completion status
- `POST /api/round/discussed` - Mark round as discussed
- `POST /api/round/next` - Start next round (saves to history)

### 🔄 Workflow

1. **Suggestion Phase**: Current picker suggests 3 items
2. **Voting Phase**: All members vote using 3-2-1 point system
3. **Results Phase**: Winner is calculated and displayed
4. **Completion Phase**: Members mark items as completed
5. **Discussion Phase**: Round is marked as discussed
6. **Next Round**: History is saved, picker rotates, new round begins

### 📱 UI Components

- **SuggestionView**: Form for submitting 3 suggestions
- **VotingView**: Interactive voting interface with live scores
- **ReadingView**: Winner display with completion tracking
- **HistoryPanel**: Chronological list of past winners

## 🎯 Future Phases

### Phase 2: Multi-Purpose Platform
- PostgreSQL database migration
- User authentication with JWTs
- Customizable club creation
- Multi-group support

### Phase 3: Mobile Expansion
- React Native mobile apps
- Push notifications
- Cross-platform synchronization

## 🛠️ Development

### Project Structure
```
TheNextPick/
├── apps/
│   ├── api/          # Go backend
│   └── web/          # React frontend
├── packages/         # Shared packages
└── README.md
```

### Technology Stack
- **Backend**: Go, Chi router, CORS
- **Frontend**: React, Next.js, TypeScript
- **Deployment**: Render (API), Vercel (Frontend)

## 📄 License

This project is part of TheNextPick platform development.