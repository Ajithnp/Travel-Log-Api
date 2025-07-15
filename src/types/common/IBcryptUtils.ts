export interface IBcryptUtils {
    /**
     * Hashes a plain text password using bcrypt.
     * @param password - The plain text password to hash.
     * @returns A promise that resolves to the hashed password.
     */
    hashPassword(password: string): Promise<string>;

    /**
     * Compares a plain text password with a hashed password.
     * @param password - The plain text password to compare.
     * @param hashedPassword - The hashed password to compare against.
     * @returns A promise that resolves to a boolean indicating whether the passwords match.
     */
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}