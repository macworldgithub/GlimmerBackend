// notification.controller.ts

import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':userId')
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(id);
  }

  @Patch(':userId/readAll')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllNotificationsAsRead(userId);
  }
}
