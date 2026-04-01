import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { organizationsApi, getErrorMessage } from "../api-client.js";

export function registerOrganizationTools(server: McpServer) {

  server.tool(
    "get-organizations",
    "Get all organizations from Pipedrive",
    {
      limit: z.number().optional().describe("Max results (default: 100)"),
      start: z.number().optional().describe("Pagination start"),
    },
    async ({ limit = 100, start = 0 }) => {
      try {
        // @ts-ignore
        const res = await organizationsApi.getOrganizations({ limit, start });
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-organization",
    "Get a specific organization by ID",
    { orgId: z.number().describe("Organization ID") },
    async ({ orgId }) => {
      try {
        // @ts-ignore
        const res = await organizationsApi.getOrganization(orgId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-organization",
    "Create a new organization in Pipedrive",
    {
      name: z.string().describe("Organization name (required)"),
      owner_id: z.number().optional().describe("Owner user ID"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility: 1=owner, 3=group, 5=company, 7=specific"),
      address: z.string().optional().describe("Address"),
    },
    async (params) => {
      try {
        const opts: any = { name: params.name };
        if (params.owner_id) opts.owner_id = params.owner_id;
        if (params.visible_to) opts.visible_to = params.visible_to;
        if (params.address) opts.address = params.address;

        // @ts-ignore
        const res = await organizationsApi.addOrganization(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, organization: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating organization: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-organization",
    "Update an existing organization",
    {
      orgId: z.number().describe("Organization ID to update"),
      name: z.string().optional().describe("New name"),
      owner_id: z.number().optional().describe("Owner user ID"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility"),
      address: z.string().optional().describe("Address"),
    },
    async ({ orgId, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }

        // @ts-ignore
        const res = await organizationsApi.updateOrganization(orgId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, organization: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating organization: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-organization",
    "Delete an organization from Pipedrive",
    { orgId: z.number().describe("Organization ID to delete") },
    async ({ orgId }) => {
      try {
        // @ts-ignore
        await organizationsApi.deleteOrganization(orgId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_org_id: orgId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error deleting organization: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search-organizations",
    "Search organizations by term",
    { term: z.string().describe("Search term") },
    async ({ term }) => {
      try {
        // @ts-ignore
        const res = await (organizationsApi as any).searchOrganization({ term });
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
