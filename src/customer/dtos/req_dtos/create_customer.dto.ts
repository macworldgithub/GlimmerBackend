// @ts-nocheck

import { Exclude } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class CreateCustomerDto {

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @Exclude()
    @IsString()
    password : string;

    constructor(c: CreateCustomerDto){
        if (!c) return
        this.name= c.name
        this.email= c.email
        this.password= c.password
    }
}
