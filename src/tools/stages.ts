import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { stagesApi, getErrorMessage } from "../api-client.js";

export function registerStageTools(server: McpServer) {

  server.tool(
    "get-stages",
    "Get all stages, optionally filtered by pipeline",
    {
      pipeline_id: z.number().optional().describe("Filter by pipeline ID"),
    },
    async ({ pipeline_id }) => {
      try {
        const opts: any = {};
        if (pipeline_id) opts.pipeline_id = pipeline_id;

        // @ts-ignore
        const res = await stagesApi.getStages(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-stage",
    "Create a new stage in a pipeline",
    {
      name: z.string().describe("Stage name (required)"),
      pipeline_id: z.number().describe("Pipeline ID (required)"),
      deal_probability: z.number().optional().describe("Deal probability percentage (0-100)"),
      order_nr: z.number().optional().describe("Order number within pipeline"),
      rotten_flag: z.enum(['0', '1']).optional().describe("Enable deal rotting: 0=off, 1=on"),
      rotten_days: z.number().optional().describe("Days before a deal is considered rotten"),
    },
    async (params) => {
      try {
        const opts: any = { name: params.name, pipeline_id: params.pipeline_id };
        if (params.deal_probability !== undefined) opts.deal_probability = params.deal_probability;
        if (params.order_nr !== undefined) opts.order_nr = params.order_nr;
        if (params.rotten_flag) opts.rotten_flag = Number(params.rotten_flag);
        if (params.rotten_days) opts.rotten_days = params.rotten_days;

        // @ts-ignore
        const res = await stagesApi.addStage(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, stage: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating stage: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-stage",
    "Update an existing stage",
    {
      stageId: z.number().describe("Stage ID to update"),
      name: z.string().optional().describe("New name"),
      pipeline_id: z.number().optional().describe("Move to another pipeline"),
      deal_probability: z.number().optional().describe("Deal probability (0-100)"),
      order_nr: z.number().optional().describe("Order number"),
      rotten_flag: z.enum(['0', '1']).optional().describe("Deal rotting: 0=off, 1=on"),
      rotten_days: z.number().optional().describe("Days before rotten"),
    },
    async ({ stageId, rotten_flag, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (rotten_flag) opts.rotten_flag = Number(rotten_flag);

        // @ts-ignore
        const res = await stagesApi.updateStage(stageId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, stage: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating stage: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-stage",
    "Delete a stage",
    { stageId: z.number().describe("Stage ID to delete") },
    async ({ stageId }) => {
      try {
        // @ts-ignore
        await stagesApi.deleteStage(stageId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_stage_id: stageId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
