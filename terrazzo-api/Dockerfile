FROM node:20

WORKDIR /workspace

# Copy workspace package files
COPY package*.json ./

# Copy all packages
COPY terrazzo-common ./terrazzo-common/
COPY terrazzo-api ./terrazzo-api/

# Install and build everything
RUN npm ci --include-workspace-root

WORKDIR /workspace/terrazzo-api

CMD ["npm", "run", "start"]