import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { activitiesApi, getErrorMessage } from "../api-client.js";

export function registerActivityTools(server: McpServer) {

  server.tool(
    "get-activities",
    "Get activities from Pipedrive with optional filters",
    {
      user_id: z.number().optional().describe("Filter by user/owner ID"),
      type: z.string().optional().describe("Filter by activity type (e.g. call, meeting, email)"),
      done: z.enum(['0', '1']).optional().describe("Filter by done status: 0=not done, 1=done"),
      start_date: z.string().optional().describe("Filter start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("Filter end date (YYYY-MM-DD)"),
      limit: z.number().optional().describe("Max results (default: 100)"),
    },
    async (params) => {
      try {
        const opts: any = { limit: params.limit || 100 };
        if (params.user_id) opts.user_id = params.user_id;
        if (params.type) opts.type = params.type;
        if (params.done) opts.done = Number(params.done);
        if (params.start_date) opts.start_date = params.start_date;
        if (params.end_date) opts.end_date = params.end_date;

        // @ts-ignore
        const res = await activitiesApi.getActivities(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-activity",
    "Get a specific activity by ID",
    { activityId: z.number().describe("Activity ID") },
    async ({ activityId }) => {
      try {
        // @ts-ignore
        const res = await activitiesApi.getActivity(activityId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-activity",
    "Create a new activity (call, meeting, task, etc.)",
    {
      subject: z.string().describe("Activity subject/title (required)"),
      type: z.string().describe("Activity type: call, meeting, task, deadline, email, lunch"),
      due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      due_time: z.string().optional().describe("Due time (HH:MM)"),
      duration: z.string().optional().describe("Duration (HH:MM)"),
      deal_id: z.number().optional().describe("Link to deal"),
      person_id: z.number().optional().describe("Link to person"),
      org_id: z.number().optional().describe("Link to organization"),
      note: z.string().optional().describe("Activity note/description"),
      done: z.enum(['0', '1']).optional().describe("0=not done, 1=done"),
      user_id: z.number().optional().describe("Assign to user"),
    },
    async (params) => {
      try {
        const opts: any = { subject: params.subject, type: params.type };
        if (params.due_date) opts.due_date = params.due_date;
        if (params.due_time) opts.due_time = params.due_time;
        if (params.duration) opts.duration = params.duration;
        if (params.deal_id) opts.deal_id = params.deal_id;
        if (params.person_id) opts.person_id = params.person_id;
        if (params.org_id) opts.org_id = params.org_id;
        if (params.note) opts.note = params.note;
        if (params.done) opts.done = Number(params.done);
        if (params.user_id) opts.user_id = params.user_id;

        // @ts-ignore
        const res = await activitiesApi.addActivity(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, activity: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating activity: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-activity",
    "Update an existing activity",
    {
      activityId: z.number().describe("Activity ID to update"),
      subject: z.string().optional().describe("New subject"),
      type: z.string().optional().describe("Activity type"),
      due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      due_time: z.string().optional().describe("Due time (HH:MM)"),
      duration: z.string().optional().describe("Duration (HH:MM)"),
      deal_id: z.number().optional().describe("Link to deal"),
      person_id: z.number().optional().describe("Link to person"),
      org_id: z.number().optional().describe("Link to organization"),
      note: z.string().optional().describe("Note"),
      done: z.enum(['0', '1']).optional().describe("0=not done, 1=done"),
    },
    async ({ activityId, done, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (done) opts.done = Number(done);

        // @ts-ignore
        const res = await activitiesApi.updateActivity(activityId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, activity: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating activity: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-activity",
    "Delete an activity",
    { activityId: z.number().describe("Activity ID to delete") },
    async ({ activityId }) => {
      try {
        // @ts-ignore
        await activitiesApi.deleteActivity(activityId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_activity_id: activityId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
