import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { productsApi, getErrorMessage } from "../api-client.js";

export function registerProductTools(server: McpServer) {

  server.tool(
    "get-products",
    "Get all products from Pipedrive",
    {
      limit: z.number().optional().describe("Max results (default: 100)"),
      start: z.number().optional().describe("Pagination start"),
    },
    async ({ limit = 100, start = 0 }) => {
      try {
        // @ts-ignore
        const res = await productsApi.getProducts({ limit, start });
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "get-product",
    "Get a specific product by ID",
    { productId: z.number().describe("Product ID") },
    async ({ productId }) => {
      try {
        // @ts-ignore
        const res = await productsApi.getProduct(productId);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "create-product",
    "Create a new product",
    {
      name: z.string().describe("Product name (required)"),
      code: z.string().optional().describe("Product code/SKU"),
      unit: z.string().optional().describe("Unit (e.g. piece, hour, kg)"),
      tax: z.number().optional().describe("Tax percentage"),
      active_flag: z.boolean().optional().describe("Active product"),
      visible_to: z.enum(['1', '3', '5', '7']).optional().describe("Visibility"),
      price: z.number().optional().describe("Price"),
      currency: z.string().optional().describe("Currency (e.g. EUR, USD)"),
    },
    async (params) => {
      try {
        const opts: any = { name: params.name };
        if (params.code) opts.code = params.code;
        if (params.unit) opts.unit = params.unit;
        if (params.tax !== undefined) opts.tax = params.tax;
        if (params.active_flag !== undefined) opts.active_flag = params.active_flag;
        if (params.visible_to) opts.visible_to = params.visible_to;
        if (params.price !== undefined) {
          opts.prices = [{ price: params.price, currency: params.currency || 'EUR' }];
        }

        // @ts-ignore
        const res = await productsApi.addProduct(opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, product: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating product: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "update-product",
    "Update an existing product",
    {
      productId: z.number().describe("Product ID to update"),
      name: z.string().optional().describe("New name"),
      code: z.string().optional().describe("Product code"),
      unit: z.string().optional().describe("Unit"),
      tax: z.number().optional().describe("Tax percentage"),
      active_flag: z.boolean().optional().describe("Active product"),
      price: z.number().optional().describe("Price"),
      currency: z.string().optional().describe("Currency"),
    },
    async ({ productId, price, currency, ...rest }) => {
      try {
        const opts: any = {};
        for (const [k, v] of Object.entries(rest)) {
          if (v !== undefined) opts[k] = v;
        }
        if (price !== undefined) {
          opts.prices = [{ price, currency: currency || 'EUR' }];
        }

        // @ts-ignore
        const res = await productsApi.updateProduct(productId, opts);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, product: res.data }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error updating product: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete-product",
    "Delete a product",
    { productId: z.number().describe("Product ID to delete") },
    async ({ productId }) => {
      try {
        // @ts-ignore
        await productsApi.deleteProduct(productId);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted_product_id: productId }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );

  server.tool(
    "search-products",
    "Search products by term",
    { term: z.string().describe("Search term") },
    async ({ term }) => {
      try {
        // @ts-ignore
        const res = await productsApi.searchProducts(term);
        return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${getErrorMessage(error)}` }], isError: true };
      }
    }
  );
}
