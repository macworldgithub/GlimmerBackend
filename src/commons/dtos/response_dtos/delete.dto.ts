import { DeleteResult } from 'mongoose';

export interface DeleteResponse extends DeleteResult {
  message: string;
}
