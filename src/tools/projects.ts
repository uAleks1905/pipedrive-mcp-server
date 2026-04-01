import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { projectsApi, getErrorMessage } from "../api-client.js";

export function registerProjectTools(server: McpServer) {

  server.tool(
    "get-projects",
    "Get all projects from Pipedrive",
    {
      limit: z.number().optional().describe("Max results (default: 100)"),
      status: z.enum(['open', 'completed', 'cancelled', 'deleted']).optional().describe("Filter by status"),
    },
    async ({ limit = 100, status }) => {
      try {
        const opts: any = { limit };
        if (status) opts.status = status;
        // @ts-ignore
        const res = await projectsApi.getProjects(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-project",
    "Get a specific project by ID",
    { projectId: z.number().describe("Project ID") },
    async ({ projectId }) => {
      try {
        // @ts-ignore
        const res = await projectsApi.getProject(projectId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-project",
    "Create a new project",
    {
      title: z.string().describe("Project title (required)"),
      board_id: z.number().optional().describe("Board ID"),
      phase_id: z.number().optional().describe("Phase ID"),
      org_id: z.number().optional().describe("Organization ID"),
      person_id: z.number().optional().describe("Person ID"),
      description: z.string().optional().describe("Project description"),
      status: z.enum(['open', 'completed', 'cancelled']).optional().describe("Status"),
      owner_id: z.number().optional().describe("Owner user ID"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async (params) => {
      try {
        const opts: any = { title: params.title };
        for (const [k, v] of Object.entries(params)) {
          if (k !== 'title' && v !== undefined) opts[k] = v;
        }
        // @ts-ignore
        const res = await projectsApi.addProject(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, project: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating project: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-project",
    "Update an existing project",
    {
      projectId: z.number().describe("Project ID to update"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("Description"),
      status: z.enum(['open', 'completed', 'cancelled']).optional().describe("Status"),
      phase_id: z.number().optional().describe("Phase ID"),
      owner_id: z.number().optional().describe("Owner user ID"),
      start_date: z.string().optional().describe("Start date"),
      end_date: z.string().optional().describe("End date"),
    },
    async ({ projectId, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        // @ts-ignore
        const res = await projectsApi.updateProject(projectId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, project: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating project: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-project",
    "Delete a project",
    { projectId: z.number().describe("Project ID to delete") },
    async ({ projectId }) => {
      try {
        // @ts-ignore
        await projectsApi.deleteProject(projectId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_project_id: projectId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
