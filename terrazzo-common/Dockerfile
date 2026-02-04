FROM node:20

WORKDIR /workspace

# Copy workspace root and all packages
COPY package*.json ./
COPY terrazzo-common ./terrazzo-common/

# Install all workspace dependencies
RUN npm ci

# Build is handled by postinstall