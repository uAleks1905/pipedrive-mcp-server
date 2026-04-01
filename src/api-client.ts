import * as pipedrive from 'pipedrive';
import * as dotenv from 'dotenv';
import Bottleneck from 'bottleneck';

dotenv.config();

// --- Error handling ---

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  return String(error);
}

// --- Rate limiter ---

const limiter = new Bottleneck({
  minTime: Number(process.env.PIPEDRIVE_RATE_LIMIT_MIN_TIME_MS || 250),
  maxConcurrent: Number(process.env.PIPEDRIVE_RATE_LIMIT_MAX_CONCURRENT || 2),
});

const withRateLimit = <T extends object>(client: T): T => {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return (...args: unknown[]) =>
          limiter.schedule(() => (value as Function).apply(target, args));
      }
      return value;
    },
  });
};

// --- Pipedrive API client ---

if (!process.env.PIPEDRIVE_API_TOKEN) {
  console.error("ERROR: PIPEDRIVE_API_TOKEN environment variable is required");
  process.exit(1);
}
if (!process.env.PIPEDRIVE_DOMAIN) {
  console.error("ERROR: PIPEDRIVE_DOMAIN environment variable is required");
  process.exit(1);
}

const apiClient = new pipedrive.ApiClient();
const domain = (process.env.PIPEDRIVE_DOMAIN || '').replace(/\/+$/, '');
apiClient.basePath = `https://${domain}/api/v1`;
apiClient.authentications = apiClient.authentications || {};
apiClient.authentications['api_key'] = {
  type: 'apiKey',
  'in': 'query',
  name: 'api_token',
  apiKey: process.env.PIPEDRIVE_API_TOKEN
};

// --- Export API instances ---

// @ts-ignore - SDK type definitions are incomplete for some APIs
export const dealsApi = withRateLimit(new pipedrive.DealsApi(apiClient));
export const personsApi = withRateLimit(new pipedrive.PersonsApi(apiClient));
export const organizationsApi = withRateLimit(new pipedrive.OrganizationsApi(apiClient));
export const pipelinesApi = withRateLimit(new pipedrive.PipelinesApi(apiClient));
// @ts-ignore
export const stagesApi = withRateLimit(new pipedrive.StagesApi(apiClient));
export const itemSearchApi = withRateLimit(new pipedrive.ItemSearchApi(apiClient));
export const leadsApi = withRateLimit(new pipedrive.LeadsApi(apiClient));
// @ts-ignore
export const activitiesApi = withRateLimit(new pipedrive.ActivitiesApi(apiClient));
// @ts-ignore
export const notesApi = withRateLimit(new pipedrive.NotesApi(apiClient));
// @ts-ignore
export const usersApi = withRateLimit(new pipedrive.UsersApi(apiClient));
// @ts-ignore
export const productsApi = withRateLimit(new pipedrive.ProductsApi(apiClient));
// @ts-ignore
export const filtersApi = withRateLimit(new pipedrive.FiltersApi(apiClient));
// @ts-ignore
export const filesApi = withRateLimit(new pipedrive.FilesApi(apiClient));
// @ts-ignore
export const projectsApi = withRateLimit(new pipedrive.ProjectsApi(apiClient));
// @ts-ignore
export const tasksApi = withRateLimit(new pipedrive.TasksApi(apiClient));
// @ts-ignore
export const goalsApi = withRateLimit(new pipedrive.GoalsApi(apiClient));
// @ts-ignore
export const webhooksApi = withRateLimit(new pipedrive.WebhooksApi(apiClient));
// @ts-ignore
export const rolesApi = withRateLimit(new pipedrive.RolesApi(apiClient));
