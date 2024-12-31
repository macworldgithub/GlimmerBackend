import { Roles } from "../enums/roles.enum";

export type AuthPayload = {
    _id: string;
    email: string;
    role: Roles
} 
