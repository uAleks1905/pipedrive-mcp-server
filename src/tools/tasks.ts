import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { tasksApi, getErrorMessage } from "../api-client.js";

export function registerTaskTools(server: McpServer) {

  server.tool(
    "get-tasks",
    "Get all tasks from Pipedrive",
    {
      project_id: z.number().optional().describe("Filter by project ID"),
      done: z.enum(['0', '1']).optional().describe("Filter: 0=incomplete, 1=complete"),
      limit: z.number().optional().describe("Max results (default: 100)"),
    },
    async ({ project_id, done, limit = 100 }) => {
      try {
        const opts: any = { limit };
        if (project_id) opts.project_id = project_id;
        if (done) opts.done = Number(done);
        // @ts-ignore
        const res = await tasksApi.getTasks(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-task",
    "Create a new task (must be associated with a project)",
    {
      title: z.string().describe("Task title (required)"),
      project_id: z.number().describe("Project ID (required)"),
      description: z.string().optional().describe("Task description"),
      parent_task_id: z.number().optional().describe("Parent task ID for subtasks"),
      assignee_id: z.number().optional().describe("Assigned user ID"),
      done: z.enum(['0', '1']).optional().describe("0=incomplete, 1=complete"),
      due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
    },
    async (params) => {
      try {
        const opts: any = { title: params.title, project_id: params.project_id };
        if (params.description) opts.description = params.description;
        if (params.parent_task_id) opts.parent_task_id = params.parent_task_id;
        if (params.assignee_id) opts.assignee_id = params.assignee_id;
        if (params.done) opts.done = Number(params.done);
        if (params.due_date) opts.due_date = params.due_date;
        // @ts-ignore
        const res = await tasksApi.addTask(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, task: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating task: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-task",
    "Update an existing task",
    {
      taskId: z.number().describe("Task ID to update"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("Description"),
      assignee_id: z.number().optional().describe("Assigned user ID"),
      done: z.enum(['0', '1']).optional().describe("0=incomplete, 1=complete"),
      due_date: z.string().optional().describe("Due date"),
    },
    async ({ taskId, done, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (done) opts.done = Number(done);
        // @ts-ignore
        const res = await tasksApi.updateTask(taskId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, task: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating task: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-task",
    "Delete a task",
    { taskId: z.number().describe("Task ID to delete") },
    async ({ taskId }) => {
      try {
        // @ts-ignore
        await tasksApi.deleteTask(taskId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_task_id: taskId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
