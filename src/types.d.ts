declare module 'pipedrive' {
  export class ApiClient {
    basePath: string;
    authentications: {
      api_key: {
        type: string;
        in: string;
        name: string;
        apiKey: string;
      };
      basic_authentication: { type: string };
      oauth2: { type: string; accessToken: string };
    };
    defaultHeaders: Record<string, string>;
    timeout: number;
    constructor();
  }

  // All API classes follow the same pattern: constructor takes ApiClient, all methods return Promise<any>
  export class DealsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class PersonsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class OrganizationsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class PipelinesApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class StagesApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class ItemSearchApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class LeadsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class ActivitiesApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class NotesApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class UsersApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class ProductsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class FiltersApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class FilesApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class ProjectsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class TasksApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class GoalsApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class WebhooksApi { constructor(apiClient: ApiClient); [method: string]: any; }
  export class RolesApi { constructor(apiClient: ApiClient); [method: string]: any; }
}
