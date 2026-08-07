export const HttpHeader = {
  // Standard Headers
  AUTHORIZATION: 'authorization',
  CONTENT_TYPE: 'content-type',
  USER_AGENT: 'user-agent',

  // Custom Headers
  X_REQUEST_ID: 'x-request-id',
  X_TRACE_ID: 'x-trace-id',
  STRIPE_SIGNATURE: 'stripe-signature',
} as const;

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
} as const;

export const HttpContentType = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  TEXT_PLAIN: 'text/plain',
} as const;
