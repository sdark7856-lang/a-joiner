# CLAUDE.md - AI Assistant Guide for a-joiner

This document provides comprehensive guidance for AI assistants working with the a-joiner codebase.

## Project Overview

**Repository**: sdark7856-lang/a-joiner
**Status**: New/Initializing
**Last Updated**: 2026-01-23

### Purpose
A Roblox auto-joiner system that manages multiple concurrent Roblox instances on a VPS. The system allows automated joining of Roblox games/servers across 20+ simultaneous instances with centralized control.

### Key Features
- Multi-instance Roblox management (20+ concurrent instances)
- WebSocket-based real-time communication
- Centralized control server for managing all instances
- Automated game joining capabilities
- Instance state monitoring and management
- Support for VPS deployment (Windows or Linux with Wine/Xvfb)

## Codebase Structure

```
a-joiner/
├── src/
│   ├── server/           # Control server and WebSocket server
│   ├── instance/         # Roblox instance manager
│   ├── automation/       # Browser/client automation logic
│   ├── api/             # REST API endpoints (optional)
│   └── utils/           # Shared utilities
├── config/              # Configuration files
├── scripts/             # Build and deployment scripts
├── tests/               # Test files
├── docs/                # Documentation
└── CLAUDE.md (this file)
```

### Directory Organization

- `/src/server` - WebSocket server, control logic, instance orchestration
- `/src/instance` - Roblox process spawning, management, lifecycle
- `/src/automation` - Selenium/Playwright automation scripts, Roblox API integration
- `/src/api` - Optional REST API for external control
- `/src/utils` - Logging, error handling, common utilities
- `/config` - Environment configs, instance settings, VPS configurations
- `/scripts` - VPS setup scripts, deployment automation
- `/tests` - Unit and integration tests

## Technology Stack

### Core Technologies

**Runtime & Language**:
- Node.js v18+ (recommended) or Python 3.10+
- TypeScript (for type safety in Node.js projects)

**WebSocket Communication**:
- `ws` (Node.js) or `websockets` (Python)
- Real-time bidirectional communication between control server and instances

**Browser Automation**:
- Selenium WebDriver or Playwright
- For controlling Roblox web interface
- ChromeDriver or equivalent for headless operation

**Process Management**:
- PM2 (Node.js) or Supervisor (Python)
- Managing multiple Roblox instance processes

**Optional Components**:
- Database: PostgreSQL or SQLite (account management, stats, logging)
- Redis: Caching, rate limiting, pub/sub
- Queue: Bull (Node.js) or Celery (Python) for task management

**VPS Requirements**:
- OS: Windows Server or Linux (Ubuntu/Debian) with Wine/Xvfb
- RAM: 40GB+ for 20 instances (2GB per instance minimum)
- CPU: 8+ cores recommended
- Display Server: Xvfb (for headless Linux)

## Development Setup

### Prerequisites

**Required Software**:
- Node.js v18+ or Python 3.10+
- Chrome/Chromium browser
- ChromeDriver (matching Chrome version)
- Git

**For Linux VPS**:
- Xvfb (virtual display server)
- Wine (if running Windows Roblox client)
- Build essentials

**For Windows VPS**:
- Visual C++ Redistributables
- .NET Framework

**Environment Variables**:
- Roblox authentication cookies
- WebSocket authentication token
- Database credentials (if using)

### Installation

**Node.js Project**:
```bash
git clone <repository-url>
cd a-joiner
npm install
cp .env.example .env
# Edit .env with your configuration
```

**Python Project**:
```bash
git clone <repository-url>
cd a-joiner
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

**Linux VPS Setup**:
```bash
# Install Xvfb for headless display
sudo apt-get update
sudo apt-get install -y xvfb chromium-browser chromium-chromedriver

# Start Xvfb
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
```

### Running the Project

**Development Mode** (Node.js):
```bash
npm run dev           # Start with hot reload
npm run server        # Start control server only
npm run instance      # Start single instance for testing
```

**Development Mode** (Python):
```bash
python src/server/main.py          # Start control server
python src/instance/manager.py     # Start instance manager
```

**Production Mode**:
```bash
npm start            # or: python src/main.py
# Or use PM2/Supervisor for process management
pm2 start ecosystem.config.js
```

### Running Tests

```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

## Development Workflows

### Git Workflow

**Branch Naming Convention**:
- Feature branches: Use the format provided in the task context (e.g., `claude/claude-md-mkr0tgbkfyxcb1w2-BC1lL`)
- Always develop on the designated branch
- Never push to different branches without explicit permission

**Commit Messages**:
- Use clear, descriptive commit messages
- Follow conventional commits format if established
- Include session URL in commits: `https://claude.ai/code/session_<id>`

**Git Operations**:
- Always use `git push -u origin <branch-name>` for pushing
- Branch names must start with 'claude/' and end with matching session id
- Retry network failures up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Code Review Process

[To be documented: Describe the PR review process, approval requirements, etc.]

## Coding Conventions

### Code Style

**[To be documented]**

Items to document:
- Indentation (spaces vs tabs, size)
- Line length limits
- Naming conventions (camelCase, snake_case, PascalCase)
- File naming conventions
- Import/export patterns

### Best Practices

**General Principles**:
- Avoid over-engineering - only make necessary changes
- Don't add features beyond what's requested
- Keep solutions simple and focused
- Delete unused code completely (no backwards-compatibility hacks)
- Only add error handling at system boundaries

**Security**:
- Watch for common vulnerabilities (XSS, SQL injection, command injection, etc.)
- Validate at system boundaries (user input, external APIs)
- Don't validate internal code that can be trusted
- Immediately fix any insecure code discovered

**Comments and Documentation**:
- Only add comments where logic isn't self-evident
- Don't add docstrings to unchanged code
- Update documentation when making significant changes

### Testing Conventions

**[To be documented]**

Items to document:
- Test file naming and location
- Testing framework usage
- Mock/stub patterns
- Coverage requirements
- Integration vs unit test guidelines

## Architecture Patterns

### Design Principles

**Architecture**: Event-driven with WebSocket communication
**Pattern**: Centralized control server with distributed worker instances

**State Management**:
- Central server maintains instance registry and state
- Each instance reports status via WebSocket
- Heartbeat mechanism for health monitoring

**Data Flow**:
1. Control server receives join command (WebSocket/REST)
2. Command distributed to available instances via WebSocket
3. Instances execute automation scripts
4. Status updates sent back to control server
5. Results aggregated and logged

**Error Handling**:
- Instance-level error recovery with automatic restart
- Connection retry logic with exponential backoff
- Dead letter queue for failed join attempts
- Comprehensive logging at all levels

**Logging**:
- Structured logging (JSON format recommended)
- Log levels: DEBUG, INFO, WARN, ERROR
- Instance-specific log files + centralized aggregation

### Key Components

**1. Control Server** (`src/server/`)
- WebSocket server for real-time communication
- Instance registry and state management
- Command distribution and orchestration
- Optional REST API for external control

**2. Instance Manager** (`src/instance/`)
- Spawn and manage Roblox processes
- Monitor instance health and resource usage
- Handle instance lifecycle (start, stop, restart)
- Resource allocation and cleanup

**3. Automation Controller** (`src/automation/`)
- Browser automation (Selenium/Playwright)
- Roblox login and authentication
- Game joining logic
- Error detection and recovery

**4. WebSocket Client** (Instance-side)
- Maintains connection to control server
- Receives commands and sends status updates
- Implements reconnection logic
- Heartbeat mechanism

### Data Models

**Instance State**:
```javascript
{
  id: string,
  status: 'idle' | 'joining' | 'in-game' | 'error' | 'offline',
  robloxAccount: string,
  currentGame: string | null,
  lastHeartbeat: timestamp,
  resourceUsage: { cpu: number, memory: number },
  errorCount: number
}
```

**Join Command**:
```javascript
{
  commandId: string,
  gameId: string,
  placeId: string,
  targetInstances: string[] | 'all',
  priority: number,
  timeout: number
}
```

**Status Update**:
```javascript
{
  instanceId: string,
  status: string,
  message: string,
  timestamp: timestamp,
  metadata: object
}
```

## API Documentation

### WebSocket API

**Connection**: `ws://server-address:8080`

**Authentication**: Include token in connection header or initial message

**Message Format**:
```javascript
{
  type: 'command' | 'status' | 'heartbeat' | 'register',
  payload: object,
  timestamp: number
}
```

**Server → Instance Commands**:

```javascript
// Join Game Command
{
  type: 'command',
  payload: {
    action: 'join',
    gameId: '123456789',
    placeId: '987654321',
    timeout: 60000
  }
}

// Stop Command
{
  type: 'command',
  payload: {
    action: 'stop'
  }
}

// Health Check
{
  type: 'heartbeat',
  payload: {}
}
```

**Instance → Server Messages**:

```javascript
// Registration
{
  type: 'register',
  payload: {
    instanceId: 'instance-1',
    capabilities: { ram: 2048, status: 'idle' }
  }
}

// Status Update
{
  type: 'status',
  payload: {
    instanceId: 'instance-1',
    status: 'in-game',
    gameId: '123456789',
    message: 'Successfully joined game'
  }
}

// Heartbeat Response
{
  type: 'heartbeat',
  payload: {
    instanceId: 'instance-1',
    timestamp: 1234567890,
    resourceUsage: { cpu: 45, memory: 1536 }
  }
}
```

### REST API (Optional)

**Base URL**: `http://server-address:3000/api/v1`

**Authentication**: Bearer token in Authorization header

**Endpoints**:

```
GET    /instances              # List all instances
GET    /instances/:id          # Get instance details
POST   /instances/:id/join     # Send join command to instance
POST   /instances/:id/stop     # Stop instance
DELETE /instances/:id          # Remove instance
GET    /stats                  # Get server statistics
```

### External APIs

**Roblox APIs** (consumed by this project):
- Authentication API (login, cookie validation)
- Games API (game info, place details)
- Presence API (user status)
- Join game deep links

## Configuration

### Environment Variables

```bash
# Server Configuration
WS_PORT=8080                    # WebSocket server port
HTTP_PORT=3000                  # REST API port (if using)
NODE_ENV=development            # Environment: development|production|test

# Instance Configuration
MAX_INSTANCES=20                # Maximum concurrent Roblox instances
INSTANCE_RAM_LIMIT=2048         # RAM limit per instance (MB)
INSTANCE_TIMEOUT=300000         # Instance operation timeout (ms)

# Roblox Configuration
ROBLOX_COOKIE=your_cookie       # Roblox authentication cookie
ROBLOX_USER_AGENT=Mozilla...    # Browser user agent string

# Display Configuration (Linux only)
DISPLAY=:99                     # Xvfb display number
XVFB_RESOLUTION=1920x1080x24   # Virtual display resolution

# Database (optional)
DATABASE_URL=postgresql://...   # Database connection string
REDIS_URL=redis://localhost:6379 # Redis connection string

# Logging
LOG_LEVEL=info                  # Logging level: debug|info|warn|error
LOG_FILE=/var/log/a-joiner.log # Log file path

# Security
WS_AUTH_TOKEN=secret_token      # WebSocket authentication token
API_KEY=your_api_key           # REST API key (if using)
```

### Configuration Files

**`config/instances.json`** - Instance configuration
```json
{
  "maxInstances": 20,
  "instanceDefaults": {
    "ramLimit": "2GB",
    "cpuLimit": "100%",
    "restartOnError": true,
    "maxRestarts": 3
  }
}
```

**`config/automation.json`** - Automation settings
```json
{
  "browser": "chrome",
  "headless": true,
  "timeout": 30000,
  "retryAttempts": 3,
  "windowSize": "1920x1080"
}
```

**`config/roblox-accounts.json`** - Account pool (keep secure!)
```json
{
  "accounts": [
    { "username": "account1", "cookie": "..." },
    { "username": "account2", "cookie": "..." }
  ]
}
```

## Dependencies

### Production Dependencies

**Node.js**:
- `ws` or `socket.io` - WebSocket server/client
- `selenium-webdriver` or `playwright` - Browser automation
- `dotenv` - Environment variable management
- `winston` or `pino` - Structured logging
- `pg` or `sqlite3` - Database driver (if using)
- `ioredis` - Redis client (if using)
- `axios` - HTTP client for Roblox APIs

**Python**:
- `websockets` or `python-socketio` - WebSocket support
- `selenium` or `playwright` - Browser automation
- `python-dotenv` - Environment variables
- `loguru` or `structlog` - Logging
- `psycopg2` or `aiosqlite` - Database drivers
- `redis-py` - Redis client
- `httpx` or `requests` - HTTP client

### Development Dependencies

**Node.js**:
- `typescript` - Type safety
- `@types/*` - Type definitions
- `jest` or `vitest` - Testing framework
- `eslint` - Code linting
- `prettier` - Code formatting
- `nodemon` - Development auto-restart

**Python**:
- `pytest` - Testing framework
- `black` - Code formatting
- `pylint` or `ruff` - Linting
- `mypy` - Type checking
- `pytest-asyncio` - Async testing

## Common Tasks

### Adding a New Feature

1. [To be documented: Step-by-step process]

### Fixing a Bug

1. [To be documented: Step-by-step process]

### Updating Dependencies

1. [To be documented: Step-by-step process]

### Deploying Changes

1. [To be documented: Deployment process]

## Troubleshooting

### Common Issues

**Instance won't start**:
- Check if Xvfb is running (Linux): `ps aux | grep Xvfb`
- Verify DISPLAY environment variable is set: `echo $DISPLAY`
- Ensure ChromeDriver version matches Chrome version
- Check RAM availability: `free -h`
- Review instance logs for specific errors

**WebSocket connection failures**:
- Verify firewall allows WebSocket port (8080)
- Check WebSocket server is running: `netstat -tulpn | grep 8080`
- Ensure authentication token is correct
- Check network connectivity between instance and server
- Review WebSocket logs for connection errors

**High resource usage**:
- Monitor with `htop` or `top`
- Reduce MAX_INSTANCES if RAM is insufficient
- Check for memory leaks in automation scripts
- Ensure proper cleanup on instance termination
- Consider increasing swap space

**Roblox authentication failures**:
- Verify Roblox cookies are valid and not expired
- Check if Roblox has rate-limited the IP
- Ensure user agent string matches browser
- Try refreshing cookies manually
- Check if account requires 2FA/security verification

**Game join failures**:
- Verify gameId and placeId are correct
- Check if game servers are online
- Ensure account has access to the game
- Review automation script for timing issues
- Check Roblox API rate limits

**Instances not responding**:
- Check heartbeat mechanism is working
- Verify instance process is still running: `ps aux | grep roblox`
- Review instance logs for crashes
- Check if instance is deadlocked or frozen
- Implement automatic restart on timeout

### VPS-Specific Troubleshooting

**Linux with Xvfb**:
```bash
# Start Xvfb if not running
Xvfb :99 -screen 0 1920x1080x24 &

# Check Xvfb process
ps aux | grep Xvfb

# Set display
export DISPLAY=:99

# Test display
DISPLAY=:99 google-chrome --headless --dump-dom https://www.google.com
```

**Windows VPS**:
- Enable Remote Desktop for debugging
- Check Windows Defender isn't blocking processes
- Verify .NET Framework is installed
- Check Windows Event Viewer for errors

**Resource Monitoring**:
```bash
# Monitor RAM usage per instance
ps aux --sort=-%mem | head -20

# Monitor CPU usage
htop -p $(pgrep -d',' chrome)

# Check disk space
df -h

# Monitor network connections
netstat -ant | grep ESTABLISHED | wc -l
```

### Debug Tools

**Logging**:
- Enable DEBUG log level in development
- Use structured logging (JSON) for easier parsing
- Centralize logs with tools like Grafana Loki or ELK stack
- Instance-specific log files: `/var/log/a-joiner/instance-{id}.log`

**Monitoring**:
- `htop` - Interactive process viewer
- `netstat` - Network connection monitoring
- `tcpdump` - Packet capture for WebSocket debugging
- Browser DevTools - Debug automation scripts
- WebSocket debugging tools (Postman, wscat)

**Performance Profiling**:
- Node.js: `node --inspect` with Chrome DevTools
- Python: `cProfile` or `py-spy`
- Memory profiling: `heapdump` (Node.js) or `memory_profiler` (Python)

**Testing WebSocket**:
```bash
# Test WebSocket connection
npm install -g wscat
wscat -c ws://localhost:8080

# Send test message
> {"type":"heartbeat","payload":{}}
```

## AI Assistant Guidelines

### Before Making Changes

1. **Always read files first** - Never propose changes to code you haven't read
2. **Use TodoWrite for complex tasks** - Plan multi-step tasks with the TodoWrite tool
3. **Understand existing patterns** - Study how similar features are implemented

### When Writing Code

1. **Security first** - Check for vulnerabilities (command injection, XSS, SQL injection, etc.)
2. **Minimal changes** - Only make requested or clearly necessary changes
3. **Avoid over-engineering**:
   - No unnecessary features or refactoring
   - No premature abstractions
   - No hypothetical future requirements
   - No defensive programming for impossible scenarios
4. **Clean deletions** - Remove unused code completely, no compatibility hacks

### Tool Usage

1. **Prefer specialized tools**:
   - Use Read instead of `cat`
   - Use Edit instead of `sed/awk`
   - Use Write instead of `echo >/cat <<EOF`
   - Use Grep instead of `grep/rg` bash commands
   - Use Glob instead of `find/ls`

2. **Use Task tool for exploration** - When gathering context or answering structural questions

3. **Parallel execution** - Run independent operations in parallel when possible

### Communication

1. **No emojis** - Unless explicitly requested by the user
2. **Concise responses** - Keep answers short and to the point
3. **Code references** - Use `file_path:line_number` format when referencing code
4. **No time estimates** - Never predict how long tasks will take

### Git Operations

1. **Read first, commit second** - Always review changes before committing
2. **Stage specific files** - Prefer adding files by name vs `git add -A`
3. **Follow commit conventions** - Match the repository's commit message style
4. **Never skip hooks** - Unless explicitly requested
5. **Never force push to main/master** - Warn if requested
6. **Create new commits** - Don't amend unless explicitly requested

## Resources

### Documentation Links

**[To be documented: Links to relevant documentation]**

### Related Projects

**[To be documented: Related repositories or projects]**

### Team Contacts

**[To be documented: Key contacts or team structure]**

## Change Log

### 2026-01-23
- Initial CLAUDE.md created
- Repository initialized
- Added comprehensive project documentation:
  - Roblox auto-joiner project details
  - Multi-instance architecture with WebSocket communication
  - Technology stack recommendations (Node.js/Python, Selenium/Playwright)
  - VPS setup and configuration guidelines
  - WebSocket API documentation
  - Troubleshooting guide for common issues
  - Resource monitoring and debugging tools

---

**Note**: This document should be updated as the project evolves. When making significant changes to architecture, conventions, or workflows, update this file accordingly to keep AI assistants informed.
