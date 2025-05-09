// notification.controller.ts

import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(@Query('userId') userId?: string) {
    if (userId) {
      return this.notificationService.getNotificationsByUser(userId);
    } else {
      return this.notificationService.findAll();
    }
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
