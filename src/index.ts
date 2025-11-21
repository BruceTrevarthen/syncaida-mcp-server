#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
// Diagram generation now happens server-side for better control and consistency

// Environment variables
const SYNCAIDA_API_URL = process.env.SYNCAIDA_API_URL || 'http://localhost:8052';
const SYNCAIDA_API_TOKEN = process.env.SYNCAIDA_API_TOKEN;

if (!SYNCAIDA_API_TOKEN) {
  console.error('Error: SYNCAIDA_API_TOKEN environment variable is required');
  process.exit(1);
}

// Create axios instance with auth
const api: AxiosInstance = axios.create({
  baseURL: SYNCAIDA_API_URL,
  headers: {
    'Authorization': `Bearer ${SYNCAIDA_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Create MCP server
const server = new Server(
  {
    name: 'syncaida-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'list_whiteboards',
    description: 'List all whiteboards in your Syncaida workspace',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_whiteboard',
    description: 'Get details of a specific whiteboard',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'string',
          description: 'The ID of the whiteboard',
        },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'create_whiteboard',
    description: 'Create a new whiteboard',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the whiteboard',
        },
        description: {
          type: 'string',
          description: 'Description of the whiteboard (optional)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_whiteboard',
    description: 'Update a whiteboard (title, description, or content)',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'string',
          description: 'The ID of the whiteboard',
        },
        title: {
          type: 'string',
          description: 'New title (optional)',
        },
        description: {
          type: 'string',
          description: 'New description (optional)',
        },
        content: {
          type: 'object',
          description: 'New Excalidraw content (optional)',
        },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'list_workboards',
    description: 'List all workboards (project management boards)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_workboard',
    description: 'Create a new workboard',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the workboard',
        },
        description: {
          type: 'string',
          description: 'Description (optional)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List all tasks',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status: pending, in_progress, completed, cancelled',
        },
      },
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the task',
        },
        description: {
          type: 'string',
          description: 'Description of the task (optional)',
        },
        priority: {
          type: 'string',
          description: 'Priority: low, medium, high, urgent',
        },
        due_date: {
          type: 'string',
          description: 'Due date in ISO format (optional)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_task',
    description: 'Update a task',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'The ID of the task',
        },
        title: {
          type: 'string',
          description: 'New title (optional)',
        },
        description: {
          type: 'string',
          description: 'New description (optional)',
        },
        status: {
          type: 'string',
          description: 'New status: pending, in_progress, completed, cancelled',
        },
        priority: {
          type: 'string',
          description: 'New priority: low, medium, high, urgent',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'create_flowchart',
    description: 'Create a flowchart diagram on a whiteboard. Perfect for process flows, decision trees, and workflows.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'string',
          description: 'The ID of the whiteboard to add the diagram to',
        },
        nodes: {
          type: 'array',
          description: 'Array of flowchart nodes',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique node ID' },
              text: { type: 'string', description: 'Node text/label' },
              type: { type: 'string', description: 'Node type: process, decision, start, end (optional)' },
            },
            required: ['id', 'text'],
          },
        },
        edges: {
          type: 'array',
          description: 'Array of connections between nodes',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string', description: 'Source node ID' },
              to: { type: 'string', description: 'Target node ID' },
              label: { type: 'string', description: 'Edge label (optional)' },
            },
            required: ['from', 'to'],
          },
        },
      },
      required: ['board_id', 'nodes', 'edges'],
    },
  },
  {
    name: 'create_architecture_diagram',
    description: 'Create a system architecture diagram on a whiteboard. Perfect for showing components, services, databases, and their connections.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: {
          type: 'string',
          description: 'The ID of the whiteboard to add the diagram to',
        },
        components: {
          type: 'array',
          description: 'Array of system components',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique component ID' },
              name: { type: 'string', description: 'Component name' },
              type: { type: 'string', description: 'Component type: service, database, frontend, backend (optional)' },
            },
            required: ['id', 'name'],
          },
        },
        connections: {
          type: 'array',
          description: 'Array of connections between components',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string', description: 'Source component ID' },
              to: { type: 'string', description: 'Target component ID' },
              label: { type: 'string', description: 'Connection label (optional)' },
            },
            required: ['from', 'to'],
          },
        },
      },
      required: ['board_id', 'components', 'connections'],
    },
  },
];

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('No arguments provided');
  }

  try {
    switch (name) {
      case 'list_whiteboards': {
        const response = await api.get('/api/v1/boards', {
          params: { all_orgs: true }
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_whiteboard': {
        const response = await api.get(`/api/v1/boards/${args.board_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'create_whiteboard': {
        const response = await api.post('/api/v1/boards', {
          title: args.title,
          description: args.description || '',
        });
        return {
          content: [
            {
              type: 'text',
              text: `Whiteboard created successfully!\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case 'update_whiteboard': {
        const updateData: any = {};
        if (args.title) updateData.title = args.title;
        if (args.description !== undefined) updateData.description = args.description;
        if (args.content) updateData.board_data = args.content;

        const response = await api.patch(`/api/v1/boards/${args.board_id}`, updateData);
        return {
          content: [
            {
              type: 'text',
              text: `Whiteboard updated successfully!\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case 'list_workboards': {
        const response = await api.get('/api/v1/workboards');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'create_workboard': {
        const response = await api.post('/api/v1/workboards', {
          title: args.title,
          description: args.description || '',
        });
        return {
          content: [
            {
              type: 'text',
              text: `Workboard created successfully!\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case 'list_tasks': {
        let url = '/api/v1/tasks';
        if (args.status) {
          url += `?status=${args.status}`;
        }
        const response = await api.get(url);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'create_task': {
        const response = await api.post('/api/v1/tasks', {
          title: args.title,
          description: args.description || '',
          priority: args.priority || 'medium',
          due_date: args.due_date || null,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Task created successfully!\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case 'update_task': {
        const updateData: any = {};
        if (args.title) updateData.title = args.title;
        if (args.description !== undefined) updateData.description = args.description;
        if (args.status) updateData.status = args.status;
        if (args.priority) updateData.priority = args.priority;

        const response = await api.patch(`/api/v1/tasks/${args.task_id}`, updateData);
        return {
          content: [
            {
              type: 'text',
              text: `Task updated successfully!\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case 'create_flowchart': {
        // Server-side diagram generation for better quality and consistency
        const response = await api.post(`/api/v1/boards/${args.board_id}/diagram/flowchart`, {
          nodes: args.nodes,
          edges: args.edges
        });

        return {
          content: [
            {
              type: 'text',
              text: `Flowchart created successfully!\n${response.data.message}\nGenerated ${response.data.element_count} Excalidraw elements.`,
            },
          ],
        };
      }

      case 'create_architecture_diagram': {
        // Server-side diagram generation for better quality and consistency
        const response = await api.post(`/api/v1/boards/${args.board_id}/diagram/architecture`, {
          components: args.components,
          connections: args.connections
        });

        return {
          content: [
            {
              type: 'text',
              text: `Architecture diagram created successfully!\n${response.data.message}\nGenerated ${response.data.element_count} Excalidraw elements.`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    // Handle error response from API
    let errorMessage = 'Unknown error';
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      // If detail is an object (like quota errors), stringify it nicely
      if (typeof detail === 'object') {
        errorMessage = detail.message || JSON.stringify(detail, null, 2);
      } else {
        errorMessage = detail;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Syncaida MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
