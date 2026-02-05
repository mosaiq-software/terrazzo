# Terrazzo
## Overview
Terrazzo is a modern web application designed to streamline project management and collaboration. It offers a suite of tools to help teams organize tasks, track progress, and communicate effectively.

---

## Architecture
Terrazzo is built entirely with Typescript in this monorepo, leveraging a modular architecture to ensure scalability and maintainability. The core components include:
- **terrazzo-api**: The main backend service that handles business logic and data management.
- **terrazzo-common**: Shared utilities and types used across different services.
- **terrazzo-db**: Database schema and migration scripts.
- **terrazzo-ui**: The frontend application built with React.

### Terrazzo API
The API is built with Node.js, Express, and Socket.io. While there are a few REST endpoints, the primary mode of communication is through WebSockets, enabling first-class real-time features.

### Terrazzo Common
This package contains shared types, interfaces, and utility functions that are used across the API and UI, promoting code reuse and consistency.
All shared logic that doesn't belong specifically to either the API or UI should be placed here and unit tested.

### Terrazzo DB
This package manages the database schema using the Sequelize ORM. It includes migration scripts to ensure the database structure is up-to-date with the application requirements.

### Terrazzo UI
The frontend is built with React and TypeScript, providing a responsive and user-friendly interface for managing projects. It communicates with the Terrazzo API primarily through WebSockets for real-time updates.

---

## Setup Instructions
### Prerequisites
- The latest version of **npm**
- **Node.js** (version 22 higher. Use nvm to manage multiple versions)
- **Docker** and **Docker Compose** for redis (*technically* optional, but highly recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mosaiq-software/terrazzo.git
   cd terrazzo
    ```
2. Install dependencies:
    This will install all necessary packages across the monorepo, and build the shared packages (`terrazzo-common` and `terrazzo-db`).
    ```bash
    npm i
    ```
3. Set up environment variables:
    Create a `.env` file in the root directory and populate it with the necessary environment variables. You can refer to the `.env.example` file or [the .env doc](https://terrazzo.mosaiq.dev/doc/89d7d150-04c3-49b2-86b7-ce1e3f3ce6b2) for guidance.

    > Make sure to set `VOLUME_PATH` to an absolute path on your machine where the database files will be stored!

4. Create the database:
    ```bash
    npm run migrate:db
    ```
5. Start the development environment:
    Open 4 terminal windows/tabs, one for each of the following commands:
    - Start the Redis server (Make sure Docker is running):
      ```bash
      npm run redis:start
      ```
    - Build the shared packages in watch mode:
      ```bash
        npm run build-watch
        ```
    - Start the Terrazzo API:
      ```bash
        npm run start:api
        ```
    - Start the Terrazzo UI:
      ```bash
        npm run start:ui
        ```

    > You can also use `npm run start` to start everything in a single terminal, but this is not recommended for development.

6. Access the application:
    Open your web browser and navigate to `http://localhost:8080` to access the Terrazzo UI.
