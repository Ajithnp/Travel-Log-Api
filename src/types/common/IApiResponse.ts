export interface IApiResponse<T = undefined> {
    success: boolean;   
    message: string;
    data?: T; 
    error?: {
        code: string; // Error code for identifying the type of error
        message: string; // readable error message
        details?: string; // Optional field for additional error details
    }
}