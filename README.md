# APiGen Studio

<div align="center">

![APiGen Studio Logo](https://img.shields.io/badge/APiGen-Studio-blue?style=for-the-badge&logo=spring&logoColor=white)

**Visual Designer for Spring Boot APIs & Microservices**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-8.3-339AF0?style=flat-square&logo=mantine&logoColor=white)](https://mantine.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

[Documentation](#table-of-contents) · [Report Bug](https://github.com/JNZader/apigen-web/issues) · [Request Feature](https://github.com/JNZader/apigen-web/issues)

</div>

---

## Overview

APiGen Studio is a modern web application that allows you to **visually design your Spring Boot API and Microservices architecture**. Create entities, define fields, establish relationships, group them into services, configure inter-service communication, and download complete, ready-to-run projects.

### What You Get

When you design your API in APiGen Studio, each entity generates:

- **Entity Class** - JPA entity extending Base with auditing
- **DTO Record** - Immutable data transfer object
- **Repository Interface** - Spring Data JPA repository
- **Service Implementation** - Business logic layer
- **REST Controller** - 12+ CRUD endpoints with HATEOAS
- **Resource Assembler** - HATEOAS link builder

For microservices architecture, you also get:

- **Service-specific configurations** - Database, ports, context paths
- **Docker & Docker Compose files** - Container-ready deployment
- **API Gateway routes** - Centralized routing configuration
- **Event definitions** - Kafka/RabbitMQ message schemas
- **Service discovery setup** - Eureka, Consul, or Kubernetes

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Docker Setup](#docker-setup)
- [User Guide](#user-guide)
- [Microservices Designer](#microservices-designer)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Visual Entity Designer** | Drag-and-drop canvas with React Flow |
| **Field Editor** | All Java types with validations |
| **Relationship Builder** | OneToMany, ManyToOne, OneToOne, ManyToMany |
| **Code Preview** | Real-time generated code preview |
| **Project Export** | Download complete Spring Boot project as ZIP |
| **SQL Import** | Parse existing database schemas |

### Microservices Features

| Feature | Description |
|---------|-------------|
| **Service Designer** | Group entities into microservices visually |
| **Service Connections** | Define REST, gRPC, Kafka, RabbitMQ, WebSocket communication |
| **Gateway Route Designer** | Configure API Gateway routes with predicates and filters |
| **Event/Message Designer** | Define Kafka topics and RabbitMQ exchanges |
| **Multi-Service Export** | Export individual services or combined archive |
| **Per-Service Config** | Database type, port, tracing, metrics per service |

### Quality of Life

| Feature | Description |
|---------|-------------|
| **Undo/Redo** | Full history (Ctrl+Z / Ctrl+Y) |
| **Keyboard Shortcuts** | Speed up your workflow |
| **Dark/Light Mode** | Comfortable viewing |
| **Auto-Layout** | Automatic entity arrangement |
| **Canvas Export** | PNG or SVG diagram export |
| **Templates** | Pre-built examples |
| **Canvas Views** | Toggle between Entities and Services view |

### Accessibility (WCAG 2.1 AA)

- Full keyboard navigation
- Screen reader support (ARIA)
- Reduced motion support
- Skip links
- High contrast compatible

---

## Quick Start

### Prerequisites

- **Node.js 18+** (for local development)
- **Docker** (recommended for consistent environment)

### Option 1: Local Development

```bash
# Clone repository
git clone https://github.com/JNZader/apigen-web.git
cd apigen-web

# Install dependencies
npm install

# Configure backend URL (optional - uses default if not set)
echo "VITE_API_URL=https://your-backend.koyeb.app" > .env.local

# Start development server
npm run dev
```

Open http://localhost:5173

### Option 2: Docker (Recommended)

```bash
# Development with hot reload
docker compose up dev

# Production build
docker compose up prod
```

- Development: http://localhost:5173
- Production: http://localhost:8080

---

## Docker Setup

### Available Commands

```bash
# Build and run development server (hot reload)
docker compose up dev

# Build and run production server
docker compose up prod

# Build only (no run)
docker compose build

# Run in background
docker compose up -d prod

# View logs
docker compose logs -f prod

# Stop all containers
docker compose down

# Rebuild without cache
docker compose build --no-cache
```

### Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build (Node + Nginx) |
| `Dockerfile.dev` | Development build with hot reload |
| `docker-compose.yml` | Orchestration for dev and prod |
| `nginx.conf` | Production server configuration |
| `.dockerignore` | Files excluded from build context |

### Environment Variables

Create `.env` or `.env.local` file for configuration:

```env
# API endpoint for server-side generation
VITE_API_URL=https://your-backend.koyeb.app
```

---

## User Guide

### Creating Your First Entity

1. **Click "Add Entity"** or press `Ctrl+N`
2. **Enter entity name** (e.g., "Product")
3. **Table name auto-generates** (e.g., "products")
4. **Click "Create"**

### Adding Fields

Each field has these properties:

| Property | Description | Example |
|----------|-------------|---------|
| **Name** | Java field name | `price` |
| **Type** | Java type | `BigDecimal` |
| **Column** | Database column | `price` |
| **Nullable** | Allow NULL | `false` |
| **Unique** | Enforce uniqueness | `true` |
| **Validations** | Constraints | `@NotNull`, `@Min(0)` |

#### Available Java Types

```
String, Long, Integer, Double, Float, BigDecimal, Boolean
LocalDate, LocalDateTime, LocalTime, UUID, byte[]
```

### Creating Relationships

**In Canvas View:**
1. Hover over an entity to see handles
2. Drag from source to target entity
3. Select relationship type

**Relationship Types:**

| Type | Description | Example |
|------|-------------|---------|
| `OneToMany` | One parent -> many children | User -> Posts |
| `ManyToOne` | Many children -> one parent | Post -> User |
| `OneToOne` | One-to-one mapping | User -> Profile |
| `ManyToMany` | Many-to-many | User <-> Roles |

### View Modes

- **Canvas View** - Visual drag-and-drop with relationship lines
- **Grid View** - Card layout for quick overview
- **Entities View** - Focus on entity design
- **Services View** - Focus on microservices architecture

### Auto Layout Options

| Layout | Description |
|--------|-------------|
| **Horizontal** | Left -> Right flow |
| **Vertical** | Top -> Bottom flow |
| **Compact** | Minimize space |
| **Spacious** | More breathing room |

### Import/Export

| Action | Description |
|--------|-------------|
| **Export JSON** | Save design to JSON file |
| **Import JSON** | Load saved design |
| **Export SQL** | Generate CREATE TABLE statements |
| **Import SQL** | Parse existing schema |
| **Download ZIP** | Complete Spring Boot project |
| **Export Services** | Individual or combined microservices |

### Templates

Pre-built examples available:
- **E-commerce** - Products, Categories, Orders
- **Blog** - Posts, Comments, Authors, Tags
- **Social Network** - Users, Posts, Followers
- **Task Manager** - Projects, Tasks, Users

---

## Microservices Designer

### Overview

The Microservices Designer allows you to organize your entities into separate services, define communication patterns, and configure each service independently.

### Creating Services

1. Switch to **Services View** in the canvas
2. Click **"Add Service"** button
3. Name your service (e.g., "User Service")
4. Drag entities into the service container
5. Configure service-specific settings

### Service Configuration

Each service can have independent configuration:

| Setting | Options |
|---------|---------|
| **Port** | Custom port (default: 8080) |
| **Context Path** | Base path (e.g., `/api/users`) |
| **Database Type** | PostgreSQL, MySQL, MongoDB, Redis, H2 |
| **Service Discovery** | Eureka, Consul, Kubernetes, None |
| **Circuit Breaker** | Enable/disable resilience |
| **Rate Limiting** | Enable/disable throttling |
| **Tracing** | Enable/disable distributed tracing |
| **Metrics** | Enable/disable Prometheus metrics |
| **Docker** | Generate Dockerfile |
| **Docker Compose** | Include in compose file |

### Service Connections

Define how services communicate:

| Protocol | Use Case |
|----------|----------|
| **REST** | Synchronous HTTP calls |
| **gRPC** | High-performance RPC |
| **Kafka** | Async event streaming |
| **RabbitMQ** | Message queue |
| **WebSocket** | Real-time bidirectional |

**Creating a connection:**
1. In Services View, drag from one service to another
2. Select communication type
3. Configure connection settings (timeout, retry, circuit breaker)

### Gateway Route Designer

Configure API Gateway routes for your microservices:

| Field | Description |
|-------|-------------|
| **Route ID** | Unique identifier |
| **Path** | URI pattern (e.g., `/api/users/**`) |
| **Target Service** | Destination service |
| **Methods** | Allowed HTTP methods |
| **Predicates** | Matching conditions |
| **Filters** | Request/response transformations |
| **Auth Required** | Enable authentication |
| **Rate Limit** | Requests per second |

### Event/Message Designer

Define async communication events:

**Kafka Events:**
- Topic name and partitions
- Replication factor
- Retention period
- Serialization format (JSON, Avro, Protobuf)
- Producer and consumer services

**RabbitMQ Events:**
- Exchange name and type (direct, topic, fanout)
- Queue configuration
- Routing keys
- Durability settings

### Multi-Service Export

Export options:

| Option | Description |
|--------|-------------|
| **Single Service** | Download one service as ZIP |
| **All Services** | Combined archive with all services |
| **With Gateway** | Include API Gateway configuration |
| **With Docker Compose** | Full orchestration setup |

The export includes security validations:
- Maximum 1000 files per archive
- Maximum 100MB total size
- Maximum 10MB per file
- Path traversal protection (Zip Slip prevention)

---

## Keyboard Shortcuts

| Shortcut | Mac | Action |
|----------|-----|--------|
| `Ctrl+N` | `Cmd+N` | Add new entity |
| `Ctrl+S` | `Cmd+S` | Quick save (JSON) |
| `Ctrl+Z` | `Cmd+Z` | Undo |
| `Ctrl+Y` | `Cmd+Y` | Redo |
| `Ctrl+Shift+Z` | `Cmd+Shift+Z` | Redo (alt) |
| `Delete` | `Delete` | Delete selected |
| `Escape` | `Escape` | Close/Deselect |

---

## Architecture

### High-Level Overview

```
+------------------------------------------------------------------+
|                       APiGen Studio                               |
+------------------------------------------------------------------+
|  Presentation Layer                                               |
|  +---------------+ +---------------+ +---------------+            |
|  |    Layout     | |    Canvas     | |    Forms      |            |
|  |   (Mantine    | |  (React Flow) | |   (Modals)    |            |
|  |   AppShell)   | |               | |               |            |
|  +---------------+ +---------------+ +---------------+            |
+------------------------------------------------------------------+
|  State Management (Zustand)                                       |
|  +---------------+ +---------------+ +---------------+            |
|  |   Project     | |    History    | |   UI State    |            |
|  |    Store      | |    Store      | |               |            |
|  |  (entities,   | |  (undo/redo)  | |  (selection,  |            |
|  |  relations,   | |               | |   modals)     |            |
|  |  services)    | |               | |               |            |
|  +---------------+ +---------------+ +---------------+            |
+------------------------------------------------------------------+
|  Utilities & Services                                             |
|  +---------------+ +---------------+ +---------------+            |
|  |     Code      | |      SQL      | |   Archive     |            |
|  |   Generator   | |    Parser     | |   Security    |            |
|  +---------------+ +---------------+ +---------------+            |
+------------------------------------------------------------------+
|  Persistence                                                      |
|  +--------------------------------------------------------------+ |
|  |                   LocalStorage                                | |
|  |                 (Zustand Persist)                             | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Data Flow

```
User Action
    |
    v
React Component (onClick, onChange)
    |
    v
Zustand Action (addEntity, updateField, addService)
    |
    v
Store State Update
    |
    v
Component Re-render (via selector subscription)
    |
    v
LocalStorage Persist (automatic)
```

### Core Data Models

```typescript
interface EntityDesign {
  id: string;              // Unique identifier
  name: string;            // "Product"
  tableName: string;       // "products"
  position: { x, y };      // Canvas coordinates
  fields: FieldDesign[];   // Entity fields
  config: EntityConfig;    // Generation options
}

interface ServiceDesign {
  id: string;
  name: string;            // "User Service"
  description?: string;
  color: string;           // Visual color
  position: { x, y };      // Canvas position
  width: number;
  height: number;
  entityIds: string[];     // Entities in this service
  config: ServiceConfig;   // Port, database, etc.
}

interface ServiceConnectionDesign {
  id: string;
  sourceServiceId: string;
  targetServiceId: string;
  communicationType: 'REST' | 'gRPC' | 'Kafka' | 'RabbitMQ' | 'WebSocket';
  config: ServiceConnectionConfig;
}

interface EventDefinition {
  id: string;
  name: string;
  brokerType: 'Kafka' | 'RabbitMQ';
  topicName: string;
  serializationFormat: 'JSON' | 'AVRO' | 'PROTOBUF';
  producerServiceIds: string[];
  consumerServiceIds: string[];
  payloadFields: EventPayloadField[];
}
```

---

## Tech Stack

### Why These Technologies?

| Technology | Why We Chose It |
|------------|-----------------|
| **React 19** | Industry standard, excellent ecosystem, concurrent features |
| **TypeScript 5.9** | Type safety, better IDE support, self-documenting code |
| **Mantine 8** | Modern, accessible, highly customizable, great TS support |
| **Zustand** | Simple state management without boilerplate |
| **React Flow** | Best-in-class node-based canvas library |
| **Vite 7** | Fast dev server, instant HMR, optimized builds |
| **Vitest** | Fast unit testing with Vite integration |
| **Biome** | Fast linting and formatting |

### Alternatives Considered

| Category | Chosen | Alternatives |
|----------|--------|--------------|
| UI Library | Mantine | MUI, Chakra, Ant Design |
| State | Zustand | Redux, MobX, Jotai |
| Canvas | React Flow | D3, JointJS, GoJS |
| Build | Vite | CRA, Next.js, Webpack |

---

## Project Structure

```
apigen-web/
├── public/                     # Static assets
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Root component
│   ├── theme.ts               # Mantine theme
│   ├── index.css              # Global styles
│   │
│   ├── api/
│   │   └── generatorApi.ts    # Backend API client
│   │
│   ├── components/
│   │   ├── Layout.tsx         # AppShell layout
│   │   ├── EntityCard.tsx     # Entity card
│   │   ├── EntityForm.tsx     # Entity modal
│   │   ├── EntityList.tsx     # Sidebar list
│   │   ├── EntityDetailPanel.tsx
│   │   ├── FieldEditor.tsx    # Field editor
│   │   ├── AddFieldForm.tsx
│   │   ├── RelationForm.tsx   # Relation modal
│   │   ├── ProjectSettings.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── SqlImportExport.tsx
│   │   ├── CodePreview.tsx
│   │   ├── Onboarding.tsx     # Welcome tutorial
│   │   ├── ErrorBoundary.tsx
│   │   │
│   │   │   # Microservices components
│   │   ├── ServiceConfigPanel.tsx    # Service configuration
│   │   ├── GatewayRouteDesigner.tsx  # Gateway routes
│   │   ├── EventMessageDesigner.tsx  # Kafka/RabbitMQ events
│   │   ├── MultiServiceExport.tsx    # Multi-service export UI
│   │   │
│   │   └── canvas/
│   │       ├── DesignerCanvas.tsx    # Main canvas (entities & services)
│   │       ├── EntityNode.tsx
│   │       ├── RelationEdge.tsx
│   │       ├── ServiceNode.tsx       # Service container node
│   │       └── ServiceConnectionEdge.tsx
│   │
│   ├── pages/
│   │   └── DesignerPage.tsx   # Main page
│   │
│   ├── store/
│   │   ├── projectStore.ts    # Main store (entities, services, etc.)
│   │   └── historyStore.ts    # Undo/redo
│   │
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useSelectedEntity.ts
│   │   ├── useEntityDeletion.ts
│   │   ├── useProjectGeneration.ts
│   │   ├── useMultiServiceExport.ts  # Multi-service export logic
│   │   ├── useHistory.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useThrottledAction.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── project.ts         # Project configuration types
│   │   ├── entity.ts          # Entity & field types
│   │   ├── relation.ts        # Relationship types
│   │   └── service.ts         # Microservice types
│   │
│   └── utils/
│       ├── codeGenerator.ts
│       ├── sqlGenerator.ts
│       ├── sqlParser.ts
│       ├── validation.ts
│       ├── canvasLayout.ts
│       ├── notifications.ts
│       ├── templates.ts
│       └── archiveSecurity.ts # ZIP security validations
│
├── Dockerfile                  # Production image
├── Dockerfile.dev             # Development image
├── docker-compose.yml         # Docker orchestration
├── docker-compose.full.yml    # Full stack with backend
├── nginx.conf                 # Production server
├── vercel.json                # Vercel deployment config
├── biome.json                 # Linting configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run lint         # Run Biome linter
npm run lint:fix     # Fix lint issues
npm run format       # Check formatting
npm run format:fix   # Fix formatting
npm run check        # Run all checks
npm run check:fix    # Fix all issues
```

### Code Style

- **Biome** for linting and formatting
- **TypeScript strict mode** enabled
- **Vitest** for testing

### Adding Components

1. Create file in `src/components/`
2. Add types to `src/types/` if needed
3. Export from index if public API
4. Add to store if state needed
5. Add tests in `*.test.ts` files

### Performance Best Practices

```typescript
// 1. Use atomic selectors
const entities = useEntities();  // Good
const { entities } = useProjectStore();  // Avoid

// 2. Use useShallow for object selectors
const { addEntity } = useEntityActions();  // Uses useShallow internally

// 3. Memoize expensive computations
const filtered = useMemo(() =>
  entities.filter(e => e.name.includes(search)),
  [entities, search]
);

// 4. Memoize callbacks
const handleDelete = useCallback((id) => {
  removeEntity(id);
}, [removeEntity]);
```

---

## Deployment

### Vercel (Recommended)

The project is pre-configured for Vercel deployment.

**Option 1: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

**Option 2: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure environment variable:
   - `VITE_API_URL` = `https://your-backend.koyeb.app`
5. Click **Deploy**

The `vercel.json` is already configured:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Static Hosting

Build output is a static SPA (`dist/` folder):

```bash
npm run build
# Upload dist/ to any static host
```

**Supported platforms:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

### Docker Production

```bash
# Build image
docker build -t apigen-studio:1.0.0 .

# Run container
docker run -d \
  --name apigen-studio \
  -p 80:80 \
  --restart unless-stopped \
  apigen-studio:1.0.0
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apigen-studio
spec:
  replicas: 2
  selector:
    matchLabels:
      app: apigen-studio
  template:
    metadata:
      labels:
        app: apigen-studio
    spec:
      containers:
      - name: apigen-studio
        image: apigen-studio:1.0.0
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
```

---

## Generated Project

When you download, you get a complete Spring Boot project:

```
my-api/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew / gradlew.bat
├── Dockerfile                    # If Docker enabled
├── docker-compose.yml            # If Docker Compose enabled
├── src/main/
│   ├── java/com/example/myapi/
│   │   ├── MyApiApplication.java
│   │   ├── domain/entity/
│   │   │   └── Product.java
│   │   ├── application/
│   │   │   ├── dto/ProductDTO.java
│   │   │   └── service/ProductService.java
│   │   ├── infrastructure/repository/
│   │   │   └── ProductRepository.java
│   │   └── interfaces/rest/
│   │       └── ProductController.java
│   └── resources/
│       └── application.yml
└── README.md
```

**Run it:**
```bash
cd my-api
./gradlew bootRun
# API available at http://localhost:8080
```

For microservices, each service is in its own folder with independent configuration.

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/apigen-web.git
cd apigen-web

# Install dependencies
npm install

# Run tests
npm run test:run

# Start development
npm run dev
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Mantine](https://mantine.dev/) - UI Components
- [React Flow](https://reactflow.dev/) - Canvas Library
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [Tabler Icons](https://tabler-icons.io/) - Icons
- [Vite](https://vitejs.dev/) - Build Tool
- [Vitest](https://vitest.dev/) - Testing Framework
- [Biome](https://biomejs.dev/) - Linting & Formatting

---

<div align="center">

**Made with love for the Java/Spring Boot community**

[Back to Top](#apigen-studio)

</div>
