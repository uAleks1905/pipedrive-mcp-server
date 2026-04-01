import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {

  server.prompt("list-all-deals", "List all deals in Pipedrive", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please list all deals in my Pipedrive account, showing their title, value, status, and stage." } }]
  }));

  server.prompt("list-all-persons", "List all persons in Pipedrive", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please list all persons in my Pipedrive account, showing their name, email, phone, and organization." } }]
  }));

  server.prompt("list-all-pipelines", "List all pipelines in Pipedrive", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please list all pipelines in my Pipedrive account, showing their name and stages." } }]
  }));

  server.prompt("analyze-deals", "Analyze deals by stage", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please analyze the deals in my Pipedrive account, grouping them by stage and providing total value for each stage." } }]
  }));

  server.prompt("analyze-contacts", "Analyze contacts by organization", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please analyze the persons in my Pipedrive account, grouping them by organization and providing a count for each organization." } }]
  }));

  server.prompt("analyze-leads", "Analyze leads by status", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please search for all leads in my Pipedrive account and group them by status." } }]
  }));

  server.prompt("compare-pipelines", "Compare different pipelines and their stages", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please list all pipelines in my Pipedrive account and compare them by showing the stages in each pipeline." } }]
  }));

  server.prompt("find-high-value-deals", "Find high-value deals", {}, () => ({
    messages: [{ role: "user", content: { type: "text", text: "Please identify the highest value deals in my Pipedrive account and provide information about which stage they're in and which person or organization they're associated with." } }]
  }));
}
