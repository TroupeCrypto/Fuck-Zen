export function json(status, data, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}

export function badRequest(message = "Bad Request", extra = {}) {
  return json(400, { ok: false, error: message, ...extra });
}

export function unauthorized(message = "Unauthorized") {
  return json(401, { ok: false, error: message });
}

export function forbidden(message = "Forbidden") {
  return json(403, { ok: false, error: message });
}

export function serverError(message = "Internal Server Error", extra = {}) {
  return json(500, { ok: false, error: message, ...extra });
}
