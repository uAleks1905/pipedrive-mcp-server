import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { leadsApi, getErrorMessage } from "../api-client.js";

export function registerLeadTools(server: McpServer) {

  server.tool(
    "get-leads",
    "Get all leads from Pipedrive",
    {
      limit: z.number().optional().describe("Max results (default: 100)"),
      archived_status: z.enum(['archived', 'not_archived', 'all']).optional().describe("Filter by archived status"),
    },
    async ({ limit = 100, archived_status }) => {
      try {
        const opts: any = { limit };
        if (archived_status) opts.archived_status = archived_status;

        // @ts-ignore
        const res = await leadsApi.getLeads(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-lead",
    "Get a specific lead by ID",
    { leadId: z.string().describe("Lead ID (UUID)") },
    async ({ leadId }) => {
      try {
        // @ts-ignore
        const res = await leadsApi.getLead(leadId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-lead",
    "Create a new lead in Pipedrive",
    {
      title: z.string().describe("Lead title (required)"),
      person_id: z.number().optional().describe("Person to link"),
      organization_id: z.number().optional().describe("Organization to link"),
      value: z.number().optional().describe("Lead value amount"),
      currency: z.string().optional().describe("Currency (e.g. EUR, USD)"),
      expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
      owner_id: z.number().optional().describe("Owner user ID"),
      label_ids: z.array(z.string()).optional().describe("Label IDs (UUIDs)"),
    },
    async (params) => {
      try {
        const opts: any = { title: params.title };
        if (params.person_id) opts.person_id = params.person_id;
        if (params.organization_id) opts.organization_id = params.organization_id;
        if (params.value !== undefined && params.currency) {
          opts.value = { amount: params.value, currency: params.currency };
        } else if (params.value !== undefined) {
          opts.value = { amount: params.value, currency: 'EUR' };
        }
        if (params.expected_close_date) opts.expected_close_date = params.expected_close_date;
        if (params.owner_id) opts.owner_id = params.owner_id;
        if (params.label_ids) opts.label_ids = params.label_ids;

        // @ts-ignore
        const res = await leadsApi.addLead(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, lead: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating lead: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-lead",
    "Update an existing lead",
    {
      leadId: z.string().describe("Lead ID (UUID) to update"),
      title: z.string().optional().describe("New title"),
      person_id: z.number().optional().describe("Person ID"),
      organization_id: z.number().optional().describe("Organization ID"),
      value: z.number().optional().describe("Lead value"),
      currency: z.string().optional().describe("Currency"),
      expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
      owner_id: z.number().optional().describe("Owner user ID"),
      is_archived: z.boolean().optional().describe("Archive/unarchive the lead"),
    },
    async ({ leadId, value, currency, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (value !== undefined) {
          opts.value = { amount: value, currency: currency || 'EUR' };
        }

        // @ts-ignore
        const res = await leadsApi.updateLead(leadId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, lead: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating lead: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-lead",
    "Delete a lead from Pipedrive",
    { leadId: z.string().describe("Lead ID (UUID) to delete") },
    async ({ leadId }) => {
      try {
        // @ts-ignore
        await leadsApi.deleteLead(leadId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_lead_id: leadId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search-leads",
    "Search leads by term",
    { term: z.string().describe("Search term") },
    async ({ term }) => {
      try {
        // @ts-ignore
        const res = await leadsApi.searchLeads(term);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
