
export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: string;
    isEmailVerified?: boolean;
    avatar?: string;
}