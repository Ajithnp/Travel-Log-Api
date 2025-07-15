export interface IRegisterUserDTO {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin" | "vendor";
}