# Pipedrive MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the Pipedrive CRM API. Provides full CRUD access to Pipedrive data for LLM applications like Claude.

## Features

- Full CRUD operations (create, read, update, delete) across all Pipedrive entities
- 60+ tools covering deals, persons, organizations, activities, notes, leads, pipelines, stages, products, filters, projects, tasks, goals, users, webhooks, and search
- Predefined prompts for common CRM operations
- Built-in rate limiting via [Bottleneck](https://github.com/SGrondin/bottleneck)
- Dual transport: stdio (local) and SSE (HTTP/Docker)
- Optional JWT authentication for SSE transport
- Docker support with multi-stage builds

## Quick Start

1. Clone and install:
   ```bash
   git clone https://github.com/uAleks1905/pipedrive-mcp-server.git
   cd pipedrive-mcp-server
   npm install
   ```

2. Create a `.env` file:
   ```
   PIPEDRIVE_API_TOKEN=your_api_token_here
   PIPEDRIVE_DOMAIN=your-company.pipedrive.com
   ```

3. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Using with Claude Code

Create a `.mcp.json` file in your project directory (see `.mcp.json.example`):

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "node",
      "args": ["/path/to/pipedrive-mcp-server/build/index.js"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_api_token_here",
        "PIPEDRIVE_DOMAIN": "your-company.pipedrive.com"
      }
    }
  }
}
```

## Using with Claude Desktop

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "node",
      "args": ["/path/to/pipedrive-mcp-server/build/index.js"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_api_token_here",
        "PIPEDRIVE_DOMAIN": "your-company.pipedrive.com"
      }
    }
  }
}
```

## Docker

### Docker Compose

```bash
cp .env.example .env
# Edit .env with your credentials
docker-compose up -d
```

### Pre-built Image

**SSE transport (HTTP access):**
```bash
docker run -d -p 3000:3000 \
  -e PIPEDRIVE_API_TOKEN=your_token \
  -e PIPEDRIVE_DOMAIN=your-company.pipedrive.com \
  -e MCP_TRANSPORT=sse \
  -e MCP_PORT=3000 \
  ghcr.io/willdent/pipedrive-mcp-server:main
```

**stdio transport (local use):**
```bash
docker run -i \
  -e PIPEDRIVE_API_TOKEN=your_token \
  -e PIPEDRIVE_DOMAIN=your-company.pipedrive.com \
  ghcr.io/willdent/pipedrive-mcp-server:main
```

## Available Tools

### Deals (8 tools)
| Tool | Description |
|------|-------------|
| `get-deals` | Get deals with flexible filtering (title, owner, stage, status, pipeline, value range) |
| `get-deal` | Get a specific deal by ID with all fields |
| `create-deal` | Create a new deal |
| `update-deal` | Update an existing deal |
| `delete-deal` | Delete a deal |
| `duplicate-deal` | Duplicate an existing deal |
| `search-deals` | Search deals by term |
| `get-deal-notes` | Get notes for a specific deal |

### Persons (6 tools)
| Tool | Description |
|------|-------------|
| `get-persons` | Get all persons from Pipedrive |
| `get-person` | Get a specific person by ID with all fields |
| `create-person` | Create a new person/contact |
| `update-person` | Update an existing person |
| `delete-person` | Delete a person |
| `search-persons` | Search persons by term |

### Organizations (6 tools)
| Tool | Description |
|------|-------------|
| `get-organizations` | Get all organizations |
| `get-organization` | Get a specific organization by ID |
| `create-organization` | Create a new organization |
| `update-organization` | Update an existing organization |
| `delete-organization` | Delete an organization |
| `search-organizations` | Search organizations by term |

### Activities (5 tools)
| Tool | Description |
|------|-------------|
| `get-activities` | Get activities with optional filters |
| `get-activity` | Get a specific activity by ID |
| `create-activity` | Create a new activity (call, meeting, task, etc.) |
| `update-activity` | Update an existing activity |
| `delete-activity` | Delete an activity |

### Notes (4 tools)
| Tool | Description |
|------|-------------|
| `get-notes` | Get notes, optionally filtered by deal, person, org, or lead |
| `create-note` | Create a new note attached to a deal, person, org, or lead |
| `update-note` | Update an existing note |
| `delete-note` | Delete a note |

### Leads (6 tools)
| Tool | Description |
|------|-------------|
| `get-leads` | Get all leads |
| `get-lead` | Get a specific lead by ID |
| `create-lead` | Create a new lead |
| `update-lead` | Update an existing lead |
| `delete-lead` | Delete a lead |
| `search-leads` | Search leads by term |

### Pipelines (5 tools)
| Tool | Description |
|------|-------------|
| `get-pipelines` | Get all pipelines |
| `get-pipeline` | Get a specific pipeline by ID |
| `create-pipeline` | Create a new pipeline |
| `update-pipeline` | Update an existing pipeline |
| `delete-pipeline` | Delete a pipeline |

### Stages (4 tools)
| Tool | Description |
|------|-------------|
| `get-stages` | Get all stages, optionally filtered by pipeline |
| `create-stage` | Create a new stage in a pipeline |
| `update-stage` | Update an existing stage |
| `delete-stage` | Delete a stage |

### Products (6 tools)
| Tool | Description |
|------|-------------|
| `get-products` | Get all products |
| `get-product` | Get a specific product by ID |
| `create-product` | Create a new product |
| `update-product` | Update an existing product |
| `delete-product` | Delete a product |
| `search-products` | Search products by term |

### Filters (5 tools)
| Tool | Description |
|------|-------------|
| `get-filters` | Get all filters |
| `get-filter` | Get a specific filter by ID with its conditions |
| `create-filter` | Create a new filter |
| `update-filter` | Update an existing filter |
| `delete-filter` | Delete a filter |

### Projects (5 tools)
| Tool | Description |
|------|-------------|
| `get-projects` | Get all projects |
| `get-project` | Get a specific project by ID |
| `create-project` | Create a new project |
| `update-project` | Update an existing project |
| `delete-project` | Delete a project |

### Tasks (4 tools)
| Tool | Description |
|------|-------------|
| `get-tasks` | Get all tasks |
| `create-task` | Create a new task (must be associated with a project) |
| `update-task` | Update an existing task |
| `delete-task` | Delete a task |

### Goals (4 tools)
| Tool | Description |
|------|-------------|
| `get-goals` | Get goals |
| `create-goal` | Create a new goal |
| `update-goal` | Update an existing goal |
| `delete-goal` | Delete a goal |

### Users (3 tools)
| Tool | Description |
|------|-------------|
| `get-users` | Get all users/owners |
| `get-user` | Get a specific user by ID |
| `get-current-user` | Get the currently authenticated user's info |

### Webhooks (3 tools)
| Tool | Description |
|------|-------------|
| `get-webhooks` | Get all configured webhooks |
| `create-webhook` | Create a new webhook |
| `delete-webhook` | Delete a webhook |

### Search (1 tool)
| Tool | Description |
|------|-------------|
| `search-all` | Search across all item types (deals, persons, organizations, products, files, activities, leads) |

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `list-all-deals` | List all deals with title, value, status, and stage |
| `list-all-persons` | List all persons with name, email, phone, and org |
| `list-all-pipelines` | List all pipelines with their stages |
| `analyze-deals` | Analyze deals grouped by stage with totals |
| `analyze-contacts` | Analyze contacts grouped by organization |
| `analyze-leads` | Analyze leads grouped by status |
| `compare-pipelines` | Compare pipelines and their stages |
| `find-high-value-deals` | Identify highest value deals |

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `PIPEDRIVE_API_TOKEN` | Your Pipedrive API token |
| `PIPEDRIVE_DOMAIN` | Your Pipedrive domain (e.g. `your-company.pipedrive.com`) |

### Optional — Rate Limiting
| Variable | Default | Description |
|----------|---------|-------------|
| `PIPEDRIVE_RATE_LIMIT_MIN_TIME_MS` | `250` | Minimum time between requests (ms) |
| `PIPEDRIVE_RATE_LIMIT_MAX_CONCURRENT` | `2` | Maximum concurrent requests |

### Optional — Transport
| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_TRANSPORT` | `stdio` | Transport type: `stdio` or `sse` |
| `MCP_PORT` | `3000` | Port for SSE transport |
| `MCP_ENDPOINT` | `/message` | Message endpoint for SSE |

### Optional — JWT Authentication
| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_JWT_SECRET` | — | JWT secret for authentication |
| `MCP_JWT_TOKEN` | — | JWT token (required when secret is set) |
| `MCP_JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `MCP_JWT_AUDIENCE` | — | JWT audience |
| `MCP_JWT_ISSUER` | — | JWT issuer |

## License

MIT
