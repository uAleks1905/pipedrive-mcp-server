import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { itemSearchApi, getErrorMessage } from "../api-client.js";

export function registerSearchTools(server: McpServer) {

  server.tool(
    "search-all",
    "Search across all item types (deals, persons, organizations, products, files, activities, leads)",
    {
      term: z.string().describe("Search term"),
      item_types: z.string().optional().describe("Comma-separated item types: deal,person,organization,product,file,activity,lead"),
      limit: z.number().optional().describe("Max results (default: 20)"),
    },
    async ({ term, item_types, limit = 20 }) => {
      try {
        const opts: any = { term, limit };
        if (item_types) opts.item_type = item_types;

        const res = await itemSearchApi.searchItem(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
