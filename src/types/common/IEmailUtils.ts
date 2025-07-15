export interface IEmailUtils {
    /**
     * Sends an email using the specified parameters.
     * @param to - The recipient's email address.
     * @param subject - The subject of the email.
     * @param link - link of the verification.
     * @param html - The HTML content of the email (optional).
     * @returns A promise that resolves to a boolean indicating success or failure.
     */
    sendEmail(to: string, subject: string, link: string, matter: string): Promise<void>;
    
}