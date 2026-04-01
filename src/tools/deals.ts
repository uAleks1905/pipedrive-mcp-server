import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dealsApi, getErrorMessage } from "../api-client.js";

export function registerDealTools(server: McpServer) {

  server.tool(
    "get-deals",
    "Get deals from Pipedrive with flexible filtering options",
    {
      searchTitle: z.string().optional().describe("Search deals by title (partial match)"),
      ownerId: z.number().optional().describe("Filter by owner/user ID"),
      stageId: z.number().optional().describe("Filter by stage ID"),
      status: z.enum(['open', 'won', 'lost', 'deleted']).optional().describe("Filter by status (default: open)"),
      pipelineId: z.number().optional().describe("Filter by pipeline ID"),
      minValue: z.number().optional().describe("Minimum deal value"),
      maxValue: z.number().optional().describe("Maximum deal value"),
      limit: z.number().optional().describe("Max results (default: 100)")
    },
    async ({ searchTitle, ownerId, stageId, status = 'open', pipelineId, minValue, maxValue, limit = 100 }) => {
      try {
        let deals: any[] = [];

        if (searchTitle) {
          // @ts-ignore
          const res = await dealsApi.searchDeals(searchTitle);
          deals = (res.data?.items || res.data || []).map((item: any) => item.item || item);
        } else {
          const params: any = { status, limit };
          if (ownerId) params.user_id = ownerId;
          if (stageId) params.stage_id = stageId;
          if (pipelineId) params.pipeline_id = pipelineId;
          // @ts-ignore
          const res = await dealsApi.getDeals(params);
          deals = res.data || [];
        }

        // Client-side value filtering
        if (minValue !== undefined || maxValue !== undefined) {
          deals = deals.filter((d: any) => {
            const v = parseFloat(d.value) || 0;
            if (minValue !== undefined && v < minValue) return false;
            if (maxValue !== undefined && v > maxValue) return false;
            return true;
          });
        }

        const summary = deals.slice(0, limit).map((d: any) => ({
          id: d.id,
          title: d.title,
          value: d.value,
          currency: d.currency,
          status: d.status,
          stage_id: d.stage_id,
          pipeline_id: d.pipeline_id,
          owner_id: d.user_id?.id || d.user_id,
          owner_name: d.user_id?.name || d.owner_name,
          org_name: d.org_id?.name || d.org_name || null,
          person_name: d.person_id?.name || d.person_name || null,
          add_time: d.add_time,
          expected_close_date: d.expected_close_date,
          won_time: d.won_time,
          lost_time: d.lost_time,
        }));

        return { content: [{ type: "text", text: JSON.stringify({ total: summary.length, deals: summary }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-deal",
    "Get a specific deal by ID with all fields",
    { dealId: z.number().describe("Deal ID") },
    async ({ dealId }) => {
      try {
        // @ts-ignore
        const res = await dealsApi.getDeal(dealId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-deal",
    "Create a new deal in Pipedrive",
    {
      title: z.string().describe("Deal title (required)"),
      value: z.number().optional().describe("Deal value"),
      currency: z.string().optional().describe("Currency (e.g. EUR, USD)"),
      person_id: z.number().optional().describe("Person to link"),
      org_id: z.number().optional().describe("Organization to link"),
      pipeline_id: z.number().optional().describe("Pipeline ID"),
      stage_id: z.number().optional().describe("Stage ID"),
      status: z.enum(['open', 'won', 'lost']).optional().describe("Deal status"),
      expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
      owner_id: z.number().optional().describe("User ID of deal owner"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility: 1=owner, 3=owner's group, 5=whole company, 7=specific groups"),
    },
    async (params) => {
      try {
        const opts: any = { title: params.title };
        if (params.value !== undefined) opts.value = params.value;
        if (params.currency) opts.currency = params.currency;
        if (params.person_id) opts.person_id = params.person_id;
        if (params.org_id) opts.org_id = params.org_id;
        if (params.pipeline_id) opts.pipeline_id = params.pipeline_id;
        if (params.stage_id) opts.stage_id = params.stage_id;
        if (params.status) opts.status = params.status;
        if (params.expected_close_date) opts.expected_close_date = params.expected_close_date;
        if (params.owner_id) opts.user_id = params.owner_id;
        if (params.visible_to) opts.visible_to = params.visible_to;

        // @ts-ignore
        const res = await dealsApi.addDeal(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deal: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating deal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-deal",
    "Update an existing deal",
    {
      dealId: z.number().describe("Deal ID to update"),
      title: z.string().optional().describe("New title"),
      value: z.number().optional().describe("New value"),
      currency: z.string().optional().describe("Currency"),
      person_id: z.number().optional().describe("Person ID"),
      org_id: z.number().optional().describe("Organization ID"),
      pipeline_id: z.number().optional().describe("Pipeline ID"),
      stage_id: z.number().optional().describe("Stage ID"),
      status: z.enum(['open', 'won', 'lost']).optional().describe("Deal status"),
      expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
      owner_id: z.number().optional().describe("New owner user ID"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility"),
    },
    async ({ dealId, owner_id, ...params }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined) opts[k] = v;
        }
        if (owner_id) opts.user_id = owner_id;

        // @ts-ignore
        const res = await dealsApi.updateDeal(dealId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deal: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating deal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-deal",
    "Delete a deal from Pipedrive",
    { dealId: z.number().describe("Deal ID to delete") },
    async ({ dealId }) => {
      try {
        // @ts-ignore
        await dealsApi.deleteDeal(dealId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_deal_id: dealId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error deleting deal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "duplicate-deal",
    "Duplicate an existing deal",
    { dealId: z.number().describe("Deal ID to duplicate") },
    async ({ dealId }) => {
      try {
        // @ts-ignore
        const res = await dealsApi.duplicateDeal(dealId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, new_deal: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error duplicating deal: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search-deals",
    "Search deals by term",
    { term: z.string().describe("Search term") },
    async ({ term }) => {
      try {
        // @ts-ignore
        const res = await dealsApi.searchDeals(term);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-deal-notes",
    "Get notes for a specific deal",
    {
      dealId: z.number().describe("Deal ID"),
      limit: z.number().optional().describe("Max notes (default: 50)")
    },
    async ({ dealId, limit = 50 }) => {
      try {
        // @ts-ignore
        const notesModule = await import("../api-client.js");
        // @ts-ignore
        const res = await notesModule.notesApi.getNotes({ deal_id: dealId, limit });
        return { content: [{ type: "text", text: JSON.stringify({ deal_id: dealId, notes: res.data || [] }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
