# Syncaida MCP Server

Connect Claude Code to your Syncaida workspace using the Model Context Protocol (MCP).

## Features

- **Whiteboard Management**: Create, list, update whiteboards
- **Diagram Generation**: Create flowcharts and architecture diagrams with AI
- **Task Management**: Create and manage tasks
- **Workboard Management**: List and create workboards
- **API Token Authentication**: Secure access using Syncaida API tokens

## Installation

### Prerequisites

- Node.js 18 or higher
- Claude Code installed
- Syncaida API token (create one at Users & Security > API Tokens)

### Global Installation

```bash
claude mcp add --scope user --transport stdio syncaida \
  --env SYNCAIDA_API_URL="http://localhost:8052" \
  --env SYNCAIDA_API_TOKEN="your-token-here" \
  -- npx @syncaida/mcp-server@latest
```

### Verify Installation

```bash
claude mcp list
```

You should see "syncaida" in the list.

## Usage Examples

### Create a Whiteboard

```
"Create a new whiteboard called 'System Architecture'"
```

### Generate a Flowchart

```
"Create a flowchart on my whiteboard showing a user login process with steps:
Start -> Enter Credentials -> Validate -> Success/Failure -> End"
```

### Create an Architecture Diagram

```
"Draw an architecture diagram showing: Frontend (React), Backend (FastAPI),
Database (PostgreSQL), and Cache (Redis) with their connections"
```

### List Tasks

```
"Show me all my tasks"
```

### Create a Task

```
"Create a high priority task: Implement authentication with due date next Friday"
```

## Available Tools

### Whiteboard Tools
- `list_whiteboards` - List all whiteboards
- `get_whiteboard` - Get whiteboard details
- `create_whiteboard` - Create a new whiteboard
- `update_whiteboard` - Update whiteboard content

### Diagram Tools
- `create_flowchart` - Generate flowcharts with auto-layout
- `create_architecture_diagram` - Create system architecture diagrams

### Task Tools
- `list_tasks` - List all tasks
- `create_task` - Create a new task
- `update_task` - Update task details

### Workboard Tools
- `list_workboards` - List all workboards
- `create_workboard` - Create a new workboard

## Configuration

The MCP server requires two environment variables:

- `SYNCAIDA_API_URL`: Your Syncaida API URL (default: http://localhost:8052)
- `SYNCAIDA_API_TOKEN`: Your Syncaida API token (required)

## Development

### Local Development

```bash
git clone https://github.com/syncaida/mcp-server
cd mcp-server
npm install
npm run build
```

### Testing Locally

```bash
claude mcp add --scope user --transport stdio syncaida-dev \
  --env SYNCAIDA_API_URL="http://localhost:8052" \
  --env SYNCAIDA_API_TOKEN="your-token-here" \
  -- node /path/to/syncaida-mcp-npm/dist/index.js
```

## Troubleshooting

### MCP server not connecting?
- Verify your API token is valid
- Check that `SYNCAIDA_API_URL` points to your running Syncaida instance
- Ensure Claude Code has been restarted

### Permission errors?
- Make sure your API token has the necessary scopes
- Check that the token hasn't been revoked

## License

MIT

## Support

For issues and questions, visit: https://github.com/syncaida/mcp-server/issues
