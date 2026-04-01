import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { notesApi, getErrorMessage } from "../api-client.js";

export function registerNoteTools(server: McpServer) {

  server.tool(
    "get-notes",
    "Get notes, optionally filtered by deal, person, org, or lead",
    {
      deal_id: z.number().optional().describe("Filter by deal ID"),
      person_id: z.number().optional().describe("Filter by person ID"),
      org_id: z.number().optional().describe("Filter by organization ID"),
      lead_id: z.string().optional().describe("Filter by lead ID"),
      limit: z.number().optional().describe("Max results (default: 50)"),
    },
    async (params) => {
      try {
        const opts: any = { limit: params.limit || 50 };
        if (params.deal_id) opts.deal_id = params.deal_id;
        if (params.person_id) opts.person_id = params.person_id;
        if (params.org_id) opts.org_id = params.org_id;
        if (params.lead_id) opts.lead_id = params.lead_id;

        // @ts-ignore
        const res = await notesApi.getNotes(opts);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-note",
    "Create a new note attached to a deal, person, organization, or lead",
    {
      content: z.string().describe("Note content (HTML supported)"),
      deal_id: z.number().optional().describe("Attach to deal"),
      person_id: z.number().optional().describe("Attach to person"),
      org_id: z.number().optional().describe("Attach to organization"),
      lead_id: z.string().optional().describe("Attach to lead"),
      pinned_to_deal_flag: z.enum(['0', '1']).optional().describe("Pin to deal"),
      pinned_to_person_flag: z.enum(['0', '1']).optional().describe("Pin to person"),
      pinned_to_organization_flag: z.enum(['0', '1']).optional().describe("Pin to organization"),
    },
    async (params) => {
      try {
        const opts: any = { content: params.content };
        if (params.deal_id) opts.deal_id = params.deal_id;
        if (params.person_id) opts.person_id = params.person_id;
        if (params.org_id) opts.org_id = params.org_id;
        if (params.lead_id) opts.lead_id = params.lead_id;
        if (params.pinned_to_deal_flag) opts.pinned_to_deal_flag = Number(params.pinned_to_deal_flag);
        if (params.pinned_to_person_flag) opts.pinned_to_person_flag = Number(params.pinned_to_person_flag);
        if (params.pinned_to_organization_flag) opts.pinned_to_organization_flag = Number(params.pinned_to_organization_flag);

        // @ts-ignore
        const res = await notesApi.addNote(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, note: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating note: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-note",
    "Update an existing note",
    {
      noteId: z.number().describe("Note ID to update"),
      content: z.string().describe("New note content (HTML supported)"),
      pinned_to_deal_flag: z.enum(['0', '1']).optional().describe("Pin to deal"),
      pinned_to_person_flag: z.enum(['0', '1']).optional().describe("Pin to person"),
      pinned_to_organization_flag: z.enum(['0', '1']).optional().describe("Pin to organization"),
    },
    async ({ noteId, content, ...flags }) => {
      try {
        const opts: any = { content };
        for (const [k, v] of Object.entries(flags)) {
          if (v !== undefined) opts[k] = Number(v);
        }

        // @ts-ignore
        const res = await notesApi.updateNote(noteId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, note: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating note: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-note",
    "Delete a note",
    { noteId: z.number().describe("Note ID to delete") },
    async ({ noteId }) => {
      try {
        // @ts-ignore
        await notesApi.deleteNote(noteId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_note_id: noteId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
