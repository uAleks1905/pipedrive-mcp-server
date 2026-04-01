import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { personsApi, getErrorMessage } from "../api-client.js";

export function registerPersonTools(server: McpServer) {

  server.tool(
    "get-persons",
    "Get all persons from Pipedrive",
    {
      limit: z.number().optional().describe("Max results (default: 100)"),
      start: z.number().optional().describe("Pagination start"),
    },
    async ({ limit = 100, start = 0 }) => {
      try {
        // @ts-ignore
        const res = await personsApi.getPersons({ limit, start });
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-person",
    "Get a specific person by ID with all fields",
    { personId: z.number().describe("Person ID") },
    async ({ personId }) => {
      try {
        // @ts-ignore
        const res = await personsApi.getPerson(personId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-person",
    "Create a new person/contact in Pipedrive",
    {
      name: z.string().describe("Person name (required)"),
      email: z.string().optional().describe("Email address"),
      phone: z.string().optional().describe("Phone number"),
      org_id: z.number().optional().describe("Organization ID to link"),
      owner_id: z.number().optional().describe("Owner user ID"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility: 1=owner, 3=group, 5=company, 7=specific"),
    },
    async (params) => {
      try {
        const opts: any = { name: params.name };
        if (params.email) opts.email = [{ value: params.email, primary: true, label: 'work' }];
        if (params.phone) opts.phone = [{ value: params.phone, primary: true, label: 'work' }];
        if (params.org_id) opts.org_id = params.org_id;
        if (params.owner_id) opts.owner_id = params.owner_id;
        if (params.visible_to) opts.visible_to = params.visible_to;

        // @ts-ignore
        const res = await personsApi.addPerson(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, person: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating person: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-person",
    "Update an existing person/contact",
    {
      personId: z.number().describe("Person ID to update"),
      name: z.string().optional().describe("New name"),
      email: z.string().optional().describe("New email"),
      phone: z.string().optional().describe("New phone"),
      org_id: z.number().optional().describe("Organization ID"),
      owner_id: z.number().optional().describe("Owner user ID"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility"),
    },
    async ({ personId, email, phone, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (email) opts.email = [{ value: email, primary: true, label: 'work' }];
        if (phone) opts.phone = [{ value: phone, primary: true, label: 'work' }];

        // @ts-ignore
        const res = await personsApi.updatePerson(personId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, person: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating person: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-person",
    "Delete a person from Pipedrive",
    { personId: z.number().describe("Person ID to delete") },
    async ({ personId }) => {
      try {
        // @ts-ignore
        await personsApi.deletePerson(personId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_person_id: personId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error deleting person: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search-persons",
    "Search persons by term",
    { term: z.string().describe("Search term (name, email, phone)") },
    async ({ term }) => {
      try {
        // @ts-ignore
        const res = await personsApi.searchPersons(term);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
