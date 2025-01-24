//@ts-nocheck
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type AdminDocument = HydratedDocument<Admin>;

@Schema()
export class Admin{
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: new Date()})
  created_at: Date;

  @Exclude()
  // mongo-schema-decorators
  @Prop({ required: false })
  password: string;

  constructor(a: Admin ) {
    if (!a) return;
    this._id = a._id?.toString();
    this.name = a.name;
    this.email = a.email;
    this.password = a.password;
  }
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminProjection = {
  [key in keyof Admin]?: 0 | 1;
};
