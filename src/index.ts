import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import jwt from 'jsonwebtoken';
import http from 'http';

// Import api-client to ensure env validation runs
import './api-client.js';

// Import tool registrations
import { registerDealTools } from './tools/deals.js';
import { registerPersonTools } from './tools/persons.js';
import { registerOrganizationTools } from './tools/organizations.js';
import { registerActivityTools } from './tools/activities.js';
import { registerNoteTools } from './tools/notes.js';
import { registerLeadTools } from './tools/leads.js';
import { registerPipelineTools } from './tools/pipelines.js';
import { registerStageTools } from './tools/stages.js';
import { registerProductTools } from './tools/products.js';
import { registerFilterTools } from './tools/filters.js';
import { registerProjectTools } from './tools/projects.js';
import { registerTaskTools } from './tools/tasks.js';
import { registerGoalTools } from './tools/goals.js';
import { registerUserTools } from './tools/users.js';
import { registerWebhookTools } from './tools/webhooks.js';
import { registerSearchTools } from './tools/search.js';
import { registerPrompts } from './prompts.js';

// --- JWT auth (optional) ---

const jwtSecret = process.env.MCP_JWT_SECRET;
const jwtAlgorithm = (process.env.MCP_JWT_ALGORITHM || 'HS256') as jwt.Algorithm;
const jwtVerifyOptions = {
  algorithms: [jwtAlgorithm],
  audience: process.env.MCP_JWT_AUDIENCE,
  issuer: process.env.MCP_JWT_ISSUER,
};

if (jwtSecret) {
  const bootToken = process.env.MCP_JWT_TOKEN;
  if (!bootToken) {
    console.error("ERROR: MCP_JWT_TOKEN is required when MCP_JWT_SECRET is set");
    process.exit(1);
  }
  try {
    jwt.verify(bootToken, jwtSecret, jwtVerifyOptions);
  } catch (error) {
    console.error("ERROR: Failed to verify MCP_JWT_TOKEN", error);
    process.exit(1);
  }
}

const verifyRequestAuthentication = (req: http.IncomingMessage) => {
  if (!jwtSecret) return { ok: true } as const;

  const header = req.headers['authorization'];
  if (!header) return { ok: false, status: 401, message: 'Missing Authorization header' } as const;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return { ok: false, status: 401, message: 'Invalid Authorization header' } as const;

  try {
    jwt.verify(token, jwtSecret, jwtVerifyOptions);
    return { ok: true } as const;
  } catch {
    return { ok: false, status: 401, message: 'Invalid or expired token' } as const;
  }
};

// --- MCP Server ---

const server = new McpServer({
  name: "pipedrive-mcp-server",
  version: "2.0.0",
  capabilities: { resources: {}, tools: {}, prompts: {} }
});

// Register all tools
registerDealTools(server);
registerPersonTools(server);
registerOrganizationTools(server);
registerActivityTools(server);
registerNoteTools(server);
registerLeadTools(server);
registerPipelineTools(server);
registerStageTools(server);
registerProductTools(server);
registerFilterTools(server);
registerProjectTools(server);
registerTaskTools(server);
registerGoalTools(server);
registerUserTools(server);
registerWebhookTools(server);
registerSearchTools(server);
registerPrompts(server);

// --- Transport ---

const transportType = process.env.MCP_TRANSPORT || 'stdio';

if (transportType === 'sse') {
  const port = parseInt(process.env.MCP_PORT || '3000', 10);
  const endpoint = process.env.MCP_ENDPOINT || '/message';
  const transports = new Map<string, SSEServerTransport>();

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'sse' }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/sse') {
      const auth = verifyRequestAuthentication(req);
      if (!auth.ok) { res.writeHead(auth.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: auth.message })); return; }

      const transport = new SSEServerTransport(endpoint, res);
      transports.set(transport.sessionId, transport);
      transport.onclose = () => { transports.delete(transport.sessionId); };

      try {
        await server.connect(transport);
        console.error(`SSE connection established: ${transport.sessionId}`);
      } catch (err) {
        console.error('SSE connection failed:', err);
        transports.delete(transport.sessionId);
      }
    } else if (req.method === 'POST' && url.pathname === endpoint) {
      const auth = verifyRequestAuthentication(req);
      if (!auth.ok) { res.writeHead(auth.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: auth.message })); return; }

      const sessionId = url.searchParams.get('sessionId') || req.headers['x-session-id'] as string;
      if (!sessionId) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing sessionId' })); return; }

      const transport = transports.get(sessionId);
      if (!transport) { res.writeHead(404); res.end(JSON.stringify({ error: 'Session not found' })); return; }

      try { await transport.handlePostMessage(req, res); }
      catch (err) { if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({ error: 'Internal error' })); } }
    } else {
      res.writeHead(404); res.end('Not found');
    }
  });

  httpServer.listen(port, () => {
    console.error(`Pipedrive MCP Server v2.0 (SSE) on port ${port}`);
  });
} else {
  const transport = new StdioServerTransport();
  server.connect(transport).catch(err => {
    console.error("Failed to start MCP server:", err);
    process.exit(1);
  });
  console.error("Pipedrive MCP Server v2.0 started (stdio)");
}
