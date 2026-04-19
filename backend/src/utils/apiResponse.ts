import { Response } from 'express';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: Record<string, any> | null;
  error: null;
}

interface ApiErrorResponse {
  success: false;
  data: null;
  meta: null;
  error: {
    code: string;
    message: string;
    details: Record<string, any> | null;
  };
}

export function ok<T>(res: Response, data: T, meta?: Record<string, any>): Response {
  return res.json({
    success: true,
    data,
    meta: meta || null,
    error: null,
  } as ApiSuccessResponse<T>);
}

export function fail(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, any>
): Response {
  return res.status(statusCode).json({
    success: false,
    data: null,
    meta: null,
    error: {
      code,
      message,
      details: details || null,
    },
  } as ApiErrorResponse);
}
