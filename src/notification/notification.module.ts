import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ← Import this
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification, NotificationSchema } from './notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService], // optional, if used outside this module
})
export class NotificationModule {}
