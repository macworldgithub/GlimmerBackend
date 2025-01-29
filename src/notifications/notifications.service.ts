import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class NotificationsService {
  async send_mail(email_options: nodemailer.SendMailOptions, transporter: nodemailer.Transporter) {
    await transporter.sendMail(email_options)
  }
}
