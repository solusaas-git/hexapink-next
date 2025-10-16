import sanitize from "mongo-sanitize";

export function sanitizeInput<T>(data: T): T {
  return sanitize(data);
}

export function sanitizeBody(body: any) {
  return sanitize(body);
}

export function sanitizeQuery(query: any) {
  return sanitize(query);
}

export function sanitizeParams(params: any) {
  return sanitize(params);
}

