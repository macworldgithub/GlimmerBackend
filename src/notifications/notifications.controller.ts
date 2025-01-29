import { Controller, Get } from '@nestjs/common'
import { NotificationsService } from './notifications.service';
import { EmailTransporter } from './classes/transporter.class';
import * as ejs from "ejs"
import { common_template } from './templates/common.template';

@Controller('notifications')
export class NotificationsController {
    constructor(private notification_service: NotificationsService) { }

    @Get()
    async testingMail() {

        try{
        const transporter = new EmailTransporter().defaultTransporter
        console.log(transporter)
        const email1 = "Support@glimmer.com"
        return this.notification_service.send_mail({
            html: ejs.render(common_template("usman", "hello this is test message")),
            subject: "Glimmer test",
            to: "usman.127.0.0.1@gmail.com",
//            from: "admin@glimmer.com.pk",
            from: email1,
        }, transporter)
        }catch(e){
            console.log("here", e)
        }
    }
}
