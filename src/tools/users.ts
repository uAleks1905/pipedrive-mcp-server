import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { usersApi, getErrorMessage } from "../api-client.js";

export function registerUserTools(server: McpServer) {

  server.tool(
    "get-users",
    "Get all users/owners from Pipedrive",
    {},
    async () => {
      try {
        const res = await usersApi.getUsers();
        const users = (res.data || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          active_flag: u.active_flag,
          role_name: u.role_name,
        }));
        return { content: [{ type: "text", text: JSON.stringify({ total: users.length, users }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-user",
    "Get a specific user by ID",
    { userId: z.number().describe("User ID") },
    async ({ userId }) => {
      try {
        // @ts-ignore
        const res = await usersApi.getUser(userId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-current-user",
    "Get the currently authenticated user's info",
    {},
    async () => {
      try {
        // @ts-ignore
        const res = await usersApi.getCurrentUser();
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
