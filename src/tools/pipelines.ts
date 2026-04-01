import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pipelinesApi, getErrorMessage } from "../api-client.js";

export function registerPipelineTools(server: McpServer) {

  server.tool(
    "get-pipelines",
    "Get all pipelines from Pipedrive",
    {},
    async () => {
      try {
        const res = await pipelinesApi.getPipelines();
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-pipeline",
    "Get a specific pipeline by ID",
    { pipelineId: z.number().describe("Pipeline ID") },
    async ({ pipelineId }) => {
      try {
        // @ts-ignore
        const res = await pipelinesApi.getPipeline(pipelineId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-pipeline",
    "Create a new pipeline",
    {
      name: z.string().describe("Pipeline name (required)"),
      deal_probability: z.enum(['0', '1']).optional().describe("Enable deal probability per stage: 0=off, 1=on"),
      order_nr: z.number().optional().describe("Order number"),
      active: z.enum(['0', '1']).optional().describe("Active: 0=inactive, 1=active"),
    },
    async (params) => {
      try {
        const opts: any = { name: params.name };
        if (params.deal_probability) opts.deal_probability = Number(params.deal_probability);
        if (params.order_nr) opts.order_nr = params.order_nr;
        if (params.active) opts.active = Number(params.active);

        // @ts-ignore
        const res = await pipelinesApi.addPipeline(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pipeline: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating pipeline: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-pipeline",
    "Update an existing pipeline",
    {
      pipelineId: z.number().describe("Pipeline ID to update"),
      name: z.string().optional().describe("New name"),
      deal_probability: z.enum(['0', '1']).optional().describe("Deal probability: 0=off, 1=on"),
      order_nr: z.number().optional().describe("Order number"),
      active: z.enum(['0', '1']).optional().describe("Active: 0=inactive, 1=active"),
    },
    async ({ pipelineId, deal_probability, active, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (deal_probability) opts.deal_probability = Number(deal_probability);
        if (active) opts.active = Number(active);

        // @ts-ignore
        const res = await pipelinesApi.updatePipeline(pipelineId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, pipeline: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating pipeline: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-pipeline",
    "Delete a pipeline",
    { pipelineId: z.number().describe("Pipeline ID to delete") },
    async ({ pipelineId }) => {
      try {
        // @ts-ignore
        await pipelinesApi.deletePipeline(pipelineId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_pipeline_id: pipelineId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
