FROM node:20

WORKDIR /workspace

# Copy workspace package files
COPY package*.json ./

# Copy all packages
COPY terrazzo-common ./terrazzo-common/
COPY terrazzo-db ./terrazzo-db/

# Install and build everything
RUN npm ci --include-workspace-root

WORKDIR /workspace/terrazzo-db

CMD ["npm", "run", "migrate:up"]
