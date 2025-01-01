import { Request } from 'express'
import { AuthPayload } from 'src/auth/payloads/auth.payload'

export interface AuthPayloadRequest extends Request {
  user: AuthPayload 
}
