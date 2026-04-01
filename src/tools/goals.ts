import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { goalsApi, getErrorMessage } from "../api-client.js";

export function registerGoalTools(server: McpServer) {

  server.tool(
    "get-goals",
    "Get goals from Pipedrive",
    {
      type_name: z.enum(['deals_won', 'deals_progressed', 'activities_completed', 'activities_added', 'deals_started']).optional().describe("Goal type"),
      is_active: z.boolean().optional().describe("Active goals only"),
    },
    async (params) => {
      try {
        const opts: any = {};
        if (params.type_name) opts.type_name = params.type_name;
        if (params.is_active !== undefined) opts.is_active = params.is_active;
        // @ts-ignore
        const res = await goalsApi.getGoals(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-goal",
    "Create a new goal",
    {
      title: z.string().describe("Goal title (required)"),
      type: z.object({
        name: z.enum(['deals_won', 'deals_progressed', 'activities_completed', 'activities_added', 'deals_started']).describe("Goal type"),
        params: z.object({
          pipeline_id: z.number().optional(),
          stage_id: z.number().optional(),
          activity_type_id: z.number().optional(),
        }).optional(),
      }).describe("Goal type configuration"),
      assignee: z.object({
        id: z.number().describe("User, company, or team ID"),
        type: z.enum(['person', 'company', 'team']).describe("Assignee type"),
      }).describe("Who this goal is for"),
      expected_outcome: z.object({
        target: z.number().describe("Target value"),
        tracking_metric: z.enum(['quantity', 'sum']).describe("Track by count or sum"),
        currency_id: z.number().optional().describe("Currency ID (for sum tracking)"),
      }).describe("Expected outcome"),
      duration: z.object({
        start: z.string().describe("Start date (YYYY-MM-DD)"),
        end: z.string().optional().describe("End date (YYYY-MM-DD)"),
      }).describe("Goal duration"),
      interval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).describe("Reporting interval"),
    },
    async (params) => {
      try {
        // @ts-ignore
        const res = await goalsApi.addGoal(params);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, goal: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating goal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-goal",
    "Update an existing goal",
    {
      goalId: z.string().describe("Goal ID to update"),
      title: z.string().optional().describe("New title"),
      is_active: z.boolean().optional().describe("Active status"),
    },
    async ({ goalId, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        // @ts-ignore
        const res = await goalsApi.updateGoal(goalId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, goal: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating goal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-goal",
    "Delete a goal",
    { goalId: z.string().describe("Goal ID to delete") },
    async ({ goalId }) => {
      try {
        // @ts-ignore
        await goalsApi.deleteGoal(goalId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_goal_id: goalId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
