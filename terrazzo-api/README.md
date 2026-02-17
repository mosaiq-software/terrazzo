# Terrazzo API

This package implements the backend API server for Terrazzo, providing real-time collaboration and data management through Socket.IO and a minimal REST API for specific use cases.

## Overview

The Terrazzo API is built on [Socket.IO](https://socket.io/) for real-time bidirectional communication, with a small Express REST API for large operations and authentication callbacks. The architecture emphasizes:

- **Real-time first**: Primary communication through WebSocket connections
- **Type-safe events**: Strongly typed event payloads and responses
- **Layered architecture**: Clear separation of concerns across persistence, controllers, and broadcasters
- **Permission-based access**: Fine-grained authorization checks
- **Collaborative editing**: Built-in support for real-time document collaboration via [Yjs](https://yjs.dev/)

## Architecture

### Socket.IO vs REST

**Primary: Socket.IO**

The API primarily uses Socket.IO for real-time communication. Clients connect via WebSocket and emit events to request data or perform actions. The server responds with typed payloads.

**Why Socket.IO?**
- **Real-time updates**: Changes made by one user are instantly broadcast to all relevant users
- **Bidirectional**: Server can push updates without client polling
- **Stateful connections**: User context persists across requests
- **Lower latency**: No connection overhead for each request
- **Collaboration support**: Natural fit for real-time collaborative editing

**Secondary: REST API**

A minimal REST API exists in [`src/rest/restApiRoutes.ts`](src/rest/restApiRoutes.ts) for specific use cases:
- File uploads and downloads (binary data)
- OAuth callback handling
- Development user creation
- Import operations (Trello board imports)

These operations don't benefit from real-time connections or are external callbacks.

### Layer System

The API follows a strict layered architecture where each layer has specific responsibilities and communication rules:

```
 ┌─────────────────────────────────────┐
 │           Client Layer              │  ← Connected clients
 │       (@mosaiq/terrazzo-ui)         │
 └─────────────────────────────────────┘
     ▲       │          ▲
     │       │          │
     │       │ emits client events                                                 ──────┐
     │       │          │ replies with client responses                                  │
     │       ▼          │                                                                │
     │   ┌─────────────────────────────────────┐                                         │
     │   │          Listeners Layer            │  ← Socket event handlers                │
     │   │  (src/listeners/)                   │    - Subscribe to client events         │
     │   └──────────────┬──────────────────────┘                                         │
     │                  │ calls                                                          │
     │                  ▼                                                                │
     │   ┌─────────────────────────────────────┐                                         │
     │   │        Controllers Layer            │  ← Business logic & orchestration       │=⪢ @mosaiq/terrazzo-api
     │   │  (src/controllers/)                 │    - Implement core operations          │
     │   └──────────┬───────────┬──────────────┘                                         │
     │              │ calls     │ calls                                                  │
     │              ▼           ▼                                                        │
     │   ┌──────────────────┐  ┌──────────────┐                                          │
     │   │   Broadcasters   │  │ Persistence  │  ← Data access                           │
     │   │     Layer        │  │  Layer       │    - Read/write DB                       │
     │   │(src/             │  │(src/         │    - Complex DB transactions             │
     │   │broadcasters/)    │  │persistence/) │    - Caching                             │
     │   └────────┬─────────┘  └──────┬───────┘                                          │
     │            │                   │ uses                                       ──────┘
     └────────────┘                   ▼
   emits server events     ┌─────────────────────────────────────┐
                           │          Database Layer             │
                           │       (@mosaiq/terrazzo-db)         │
                           └─────────────────────────────────────┘
```

**Key Principles:**
- Data flows down the stack
- Updates are broadcast back up 
- Listeners never directly access the database
- Persistence functions are pure data operations

### Listeners
**Purpose**: Handle incoming Socket.IO events from clients

Listeners are the entry point for all client requests over WebSocket. Each listener:
- Receives an event from a connected client
- Validates permissions (using utility functions)
- Calls the appropriate controller function
- Returns a typed response to the client
- Uses the `subscribe` helper for type-safe event handling

### Controllers
**Purpose**: Implement business logic and orchestrate operations

Controllers contain the core business logic of the application. They:
- Coordinate between persistence and broadcasters
- Implement complex operations that span multiple entities
- Handle data transformation and validation
- Trigger broadcasts to notify other users of changes

### Persistence
**Purpose**: Direct database access and caching

Persistence functions are the only layer that directly interacts with the database. They:
- Perform CRUD operations on database models
- Manage cache reads and writes
- Return typed model data
- Have no business logic (except for transactions)
- Function names end with `Db` suffix (convention)
- Use caching layer when appropriate
- Invalidate cache after updates/deletes

### Broadcasters
**Purpose**: Send real-time updates to connected clients

Broadcasters push updates to clients when data changes. They:
- Identify which users should receive updates (via rooms)
- Build permission-filtered payloads per user
- Send typed events to connected sockets
- Called by controllers after data changes
- Use the `broadcast` helper for type-safe multicasting
- Users who fail permission checks are skipped

## Socket.IO Concepts

### Rooms

Rooms are Socket.IO's way of grouping connections. Each room has a unique string ID. A socket† has a Set of joined rooms.
This unique string ID has 3 parts:
- Room Type: The kind of operation that will be performed in this room (usually `data`)
- UID: The unique identifier for the entity (e.g. a board ID)
- Specifier: The specific aspect of the entity that is being listened to (e.g. `invites`, or `roles` for an organization)

Sockets† can join or leave rooms at will. Any event can be broadcast to a room. When an event is broadcast to a room, all sockets† in that room will attempt to get the event.

† A "socket" from the API's perspective is single connected client
**Learn more**: [Socket.IO Rooms Documentation](https://socket.io/docs/v4/rooms/)

### Events

All events are strongly typed using the `@mosaiq/terrazzo-common` package:
- **Client events** (`ClientSE`): Sent from client to server
- **Server events** (`ServerSE`): Sent from server to client

Each event has a defined payload type and response type, ensuring type safety across the stack.

Client events will typically have the form of an input payload and expect a response payload - similar to a standard API request/response cycle.
Server events are one-way notifications sent to clients without expecting a response

### Connection Flow

1. Client connects with authentication token in handshake
2. Server validates token and initializes socket data
3. User automatically joins their user room
4. Client can join additional rooms (boards, documents)
5. Server sends `READY` event when setup completes to inform the client to start listening/emitting
6. Listeners are registered and client can emit events

## Real-Time Collaboration

The API includes [Yjs](https://yjs.dev/) integration for collaborative text editing:
- Text blocks use Yjs CRDTs for conflict-free editing
- Multiple users can edit simultaneously
- Changes are synchronized in real-time
- Built-in undo/redo and awareness (cursor positions)

The `YSocketIO` class (in `src/utils/y-socket-io`) bridges Yjs documents with Socket.IO connections.
This is based off of y-socket.io but heavily modified for Terrazzo's custom architecture.

**Learn more**: [Yjs Documentation](https://docs.yjs.dev/)

## Best Practices

1. **Follow the layer rules**: Never skip layers or call in the wrong direction. We wan't to minimize circular dependencies!
2. **Check permissions early**: Validate in listeners before calling controllers
3. **Broadcast changes**: Always notify users after data mutations
4. **Use transactions**: Wrap multi-part database operations in transactions
5. **Type everything**: Leverage TypeScript for event payloads and responses
6. **Handle errors**: Use try-catch blocks and provide meaningful error messages
7. **Cache wisely**: Use caching for frequently read data, invalidate after writes
