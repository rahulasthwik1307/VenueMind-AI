import { ApiResponse } from '../types/response';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    if (!response.ok) {
      return {
        status: response.status,
        error: {
          code: 'API_ERROR',
          message: data.message || 'An error occurred during API request',
          details: data,
        },
      };
    }
    return {
      status: response.status,
      data: data as T,
    };
  } catch (error: any) {
    return {
      status: 500,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error or request timeout',
      },
    };
  }
}
