export interface IApiResponse<T = undefined> {
    success: boolean;   
    message: string;
    data?: T; // Optional data field for successful responses
    error?: {
        code: string; // Error code for identifying the type of error
        message: string; // readable error message
        details?: string; // Optional field for additional error details
    }
}