import { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse, PaginationMeta, ErrorCodes } from './api-response.types';

export class ApiResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    count?: number
  ): ApiSuccessResponse<T> {
    return {
      status: 'success',
      success: true,
      message,
      data,
      count,
      timestamp: new Date().toISOString()
    };
  }

  static successWithCount<T>(
    data: T[],
    message: string = 'Data retrieved successfully'
  ): ApiSuccessResponse<T[]> {
    return {
      status: 'success',
      success: true,
      message,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  }

  static successPaginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Data retrieved successfully'
  ): PaginatedResponse<T> {
    return {
      status: 'success',
      success: true,
      message,
      data,
      count: data.length,
      pagination,
      timestamp: new Date().toISOString()
    };
  }

  static error(
    message: string,
    error?: string,
    errorCode?: string
  ): ApiErrorResponse {
    return {
      success: false,
      message,
      error,
      errorCode,
      timestamp: new Date().toISOString()
    };
  }

  static notFound(
    resource: string,
    id?: string | number
  ): ApiErrorResponse {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    return this.error(message, 'NOT_FOUND', ErrorCodes.NOT_FOUND);
  }

  static foreignKeyConstraint(
    resource: string,
    details?: string
  ): ApiErrorResponse {
    const message = details
      ? `Foreign key constraint failed for ${resource}: ${details}`
      : `Foreign key constraint failed for ${resource}`;
    return this.error(message, 'FOREIGN_KEY_CONSTRAINT', ErrorCodes.FOREIGN_KEY_CONSTRAINT);
  }

  static updateFailed(
    resource: string,
    id: string | number,
    details?: string
  ): ApiErrorResponse {
    const message = details
      ? `Failed to update ${resource} with ID ${id}: ${details}`
      : `Failed to update ${resource} with ID ${id}`;
    return this.error(message, 'UPDATE_FAILED', ErrorCodes.UPDATE_FAILED);
  }

  static emptyList(
    resource: string,
    message?: string
  ): ApiSuccessResponse<any[]> {
    return this.successWithCount(
      [],
      message || `No ${resource} found`
    );
  }

  static deleted(
    resource: string,
    id: string | number,
    additionalInfo?: string
  ): { message: string; data: any; status: string } {
    return {
      status: 'success',
      message: `${resource} with ID ${id} has been successfully deleted`,
      data: { deletedId: id, additionalInfo }
    };
  }

  static created<T>(
    data: T,
    resource: string
  ): ApiSuccessResponse<T> {
    return this.success(
      data,
      `${resource} created successfully`
    );
  }

  static updated<T>(
    data: T,
    resource: string
  ): ApiSuccessResponse<T> {
    return this.success(
      data,
      `${resource} updated successfully`
    );
  }
}
