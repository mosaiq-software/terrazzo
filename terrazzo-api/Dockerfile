FROM node:20

WORKDIR /workspace

# Copy workspace package files
COPY package*.json ./
COPY scripts ./scripts/

# Copy all packages
COPY terrazzo-common ./terrazzo-common/
COPY terrazzo-db ./terrazzo-db/
COPY terrazzo-api ./terrazzo-api/

# Install and build everything
RUN npm ci --include-workspace-root

WORKDIR /workspace/terrazzo-api

CMD ["npm", "run", "start"]