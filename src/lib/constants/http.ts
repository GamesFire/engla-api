export const HttpHeader = {
  // Standard Headers
  AUTHORIZATION: 'authorization',
  CONTENT_TYPE: 'content-type',
  USER_AGENT: 'user-agent',

  // Custom Headers
  X_REQUEST_ID: 'x-request-id',
  X_TRACE_ID: 'x-trace-id',
} as const;

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
} as const;
