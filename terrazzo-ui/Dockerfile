FROM node:20

WORKDIR /workspace

# Copy workspace package files
COPY package*.json ./

# Copy all packages
COPY terrazzo-common ./terrazzo-common/
COPY terrazzo-ui ./terrazzo-ui/

# Install and build everything
RUN npm ci --include-workspace-root

WORKDIR /workspace/terrazzo-ui
RUN npm run build

CMD ["sh", "-c", "rm -rf /www/* && cp -r ./dist/* /www"]