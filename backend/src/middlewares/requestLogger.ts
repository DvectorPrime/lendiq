import { type NextFunction, type Request, type Response } from 'express';

type LoggerRequest = Request & {
  startTime?: number;
};

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const request = req as LoggerRequest;
  request.startTime = Date.now();

  const startedAtIso = new Date(request.startTime).toISOString();
  const ip = getClientIp(req);

  console.log(`[REQ] ${startedAtIso} ${req.method} ${req.originalUrl} ip=${ip}`);

  res.on('finish', () => {
    const durationMs = Math.max(0, Date.now() - (request.startTime || Date.now()));
    const contentLength = res.getHeader('content-length');
    const contentLengthValue = typeof contentLength === 'string' ? contentLength : String(contentLength || '0');

    console.log(
      `[RES] ${new Date().toISOString()} ${req.method} ${req.originalUrl} status=${res.statusCode} duration_ms=${durationMs} bytes=${contentLengthValue}`
    );
  });

  next();
}
