export interface VercelRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface VercelResponse {
  headersSent: boolean;
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  setHeader(name: string, value: string | readonly string[]): VercelResponse;
  writeHead(statusCode: number, headers?: Record<string, string>): VercelResponse;
  write(chunk: string | Uint8Array): boolean;
  end(chunk?: string): VercelResponse;
}
