import { Transporter as NmTransporter, createTransport, TransportOptions } from 'nodemailer'

export class EmailTransporter {
    defaultTransporter: NmTransporter
    email?: string

    constructor() {
        this.defaultTransporter = this.create_smtp_transporter()
    }

    public create_gmail_transporter() {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        } as TransportOptions)

        this.email = process.env.EMAIL

        return transporter
    }
    public create_smtp_transporter() {
        const email1 = "Support@glimmer.com"
        const pass = "Glimmer@090"
        const transporter = createTransport({
            host: "smtp.titan.email",
            port: 465,
            secure: true,
            auth: {
//                user: "admin@glimmer.com.pk",
//                pass: 'n/W0kGp5+',
                user: email1,
                pass: pass
            },
        } as TransportOptions);

        return transporter
    }

}
