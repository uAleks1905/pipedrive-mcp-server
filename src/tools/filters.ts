import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { filtersApi, getErrorMessage } from "../api-client.js";

export function registerFilterTools(server: McpServer) {

  server.tool(
    "get-filters",
    "Get all filters from Pipedrive",
    {
      type: z.enum(['deals', 'leads', 'org', 'people', 'products', 'activity', 'projects']).optional().describe("Filter type"),
    },
    async ({ type }) => {
      try {
        const opts: any = {};
        if (type) opts.type = type;

        // @ts-ignore
        const res = await filtersApi.getFilters(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-filter",
    "Get a specific filter by ID with its conditions",
    { filterId: z.number().describe("Filter ID") },
    async ({ filterId }) => {
      try {
        // @ts-ignore
        const res = await filtersApi.getFilter(filterId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-filter",
    "Create a new filter. Conditions use nested AND/OR groups. Max 16 conditions. Use get-filter on an existing filter to see the conditions format.",
    {
      name: z.string().describe("Filter name (required)"),
      type: z.enum(['deals', 'leads', 'org', 'people', 'products', 'activity', 'projects']).describe("Filter type (required)"),
      conditions: z.string().describe("JSON string of filter conditions object with 'glue' (and/or) and 'conditions' array"),
    },
    async (params) => {
      try {
        let conditions;
        try {
          conditions = JSON.parse(params.conditions);
        } catch {
          return { content: [{ type: "text", text: "Error: conditions must be a valid JSON string" }], isError: true };
        }

        // @ts-ignore
        const res = await filtersApi.addFilter({
          name: params.name,
          type: params.type,
          conditions,
        });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, filter: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating filter: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-filter",
    "Update an existing filter",
    {
      filterId: z.number().describe("Filter ID to update"),
      name: z.string().optional().describe("New name"),
      conditions: z.string().optional().describe("New conditions (JSON string)"),
    },
    async ({ filterId, name, conditions: condStr }) => {
      try {
        const opts: any = {};
        if (name) opts.name = name;
        if (condStr) {
          try {
            opts.conditions = JSON.parse(condStr);
          } catch {
            return { content: [{ type: "text", text: "Error: conditions must be a valid JSON string" }], isError: true };
          }
        }

        // @ts-ignore
        const res = await filtersApi.updateFilter(filterId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, filter: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating filter: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-filter",
    "Delete a filter",
    { filterId: z.number().describe("Filter ID to delete") },
    async ({ filterId }) => {
      try {
        // @ts-ignore
        await filtersApi.deleteFilter(filterId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_filter_id: filterId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
