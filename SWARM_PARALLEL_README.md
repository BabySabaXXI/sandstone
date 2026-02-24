# Sandstone Swarm - Parallel Execution

## 🐝 100 Agents Running Simultaneously

### Dashboard
Visit `/swarm` to see all 100 agents running in real-time.

### API Endpoints
- `GET /api/swarm/status` - Get all agent statuses
- `POST /api/swarm/execute` - Start parallel execution
- `GET /api/agents/status` - Alternative agent status endpoint

### Running the Swarm

#### Option 1: Web Dashboard
```bash
npm run dev
# Open http://localhost:3000/swarm
```

#### Option 2: Parallel Script
```bash
./scripts/run-swarm-parallel.sh
```

#### Option 3: API Call
```bash
curl -X POST http://localhost:3000/api/swarm/execute
```

### Agent Distribution

| Squad | Agents | Status |
|-------|--------|--------|
| Backend | 15 | Running in parallel |
| Frontend | 20 | Running in parallel |
| UI/UX | 15 | Running in parallel |
| Auth | 10 | Running in parallel |
| Bug Fix | 15 | Running in parallel |
| Features | 15 | Running in parallel |
| Deploy | 10 | Running in parallel |
| **Total** | **100** | **All parallel** |

### Features
- ✅ Real-time progress tracking
- ✅ Visual dashboard with live updates
- ✅ Parallel execution (all 100 at once)
- ✅ Squad-based organization
- ✅ Individual agent status
- ✅ Overall progress bar
- ✅ Color-coded by squad
