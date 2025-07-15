export interface UserCreateDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    profile?: string;
}