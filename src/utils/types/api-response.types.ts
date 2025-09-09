export interface ApiSuccessResponse<T = any> {
  status?: 'success';
  success: true;
  message: string;
  data: T;
  count?: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

export enum ErrorCodes {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  CREATION_FAILED = 'CREATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETION_FAILED = 'DELETION_FAILED',
  RETRIEVAL_FAILED = 'RETRIEVAL_FAILED',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
