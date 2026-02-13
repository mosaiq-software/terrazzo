FROM node:20

WORKDIR /workspace

# Copy workspace package files
COPY package*.json ./
COPY scripts ./scripts/

# Copy all packages
COPY terrazzo-common ./terrazzo-common/
COPY terrazzo-ui ./terrazzo-ui/

# Install and build everything
RUN npm ci --include-workspace-root

WORKDIR /workspace/terrazzo-ui

# Build at container runtime so env vars provided via docker-compose `env_file`
# are available to Vite during build.
CMD ["sh", "-c", "npm run build && rm -rf /www/* && cp -r ./dist/* /www"]