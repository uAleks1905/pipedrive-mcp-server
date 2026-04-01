import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { webhooksApi, getErrorMessage } from "../api-client.js";

export function registerWebhookTools(server: McpServer) {

  server.tool(
    "get-webhooks",
    "Get all webhooks configured in Pipedrive",
    {},
    async () => {
      try {
        // @ts-ignore
        const res = await webhooksApi.getWebhooks();
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-webhook",
    "Create a new webhook to receive event notifications",
    {
      subscription_url: z.string().describe("URL to receive webhook callbacks (required)"),
      event_action: z.enum(['added', 'updated', 'merged', 'deleted', '*']).describe("Event action to listen for"),
      event_object: z.enum(['deal', 'person', 'organization', 'activity', 'note', 'lead', 'product', 'pipeline', 'stage', '*']).describe("Object type to listen for"),
    },
    async (params) => {
      try {
        // @ts-ignore
        const res = await webhooksApi.addWebhook(params);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, webhook: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating webhook: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-webhook",
    "Delete a webhook",
    { webhookId: z.number().describe("Webhook ID to delete") },
    async ({ webhookId }) => {
      try {
        // @ts-ignore
        await webhooksApi.deleteWebhook(webhookId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_webhook_id: webhookId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
