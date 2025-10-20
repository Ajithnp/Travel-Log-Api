export interface IS3Service {
    getObjectURL(key: string): Promise<string>;
}