## NPM Workspaces Setup

This is a monorepo managed with npm workspaces.

### Local Development

1. **Install all dependencies** (from root):
   ```bash
   npm i
   ```
   This installs all packages and builds `terrazzo-common` automatically via postinstall.

2. **Start development servers**:
   ```bash
   npm start
   ```
   Runs common build in watch mode + api + ui simultaneously.

### Workspace Commands

Run commands in specific packages:
```bash
npm run test --workspace=terrazzo-api
npm run lint --workspace=terrazzo-ui
```

Or run in all workspaces:
```bash
npm run test --workspaces
```

### How It Works

- **Workspaces**: All packages are linked via `workspace:*` protocol
- **Hoisting**: Dependencies are installed at the root `node_modules` where possible
- **Single install**: One `npm install` at root handles all packages
- **Automatic linking**: `terrazzo-common` is automatically symlinked to api/ui/db

### Docker

Docker builds work with workspaces by copying the entire workspace structure and running `npm ci` at the root level.
