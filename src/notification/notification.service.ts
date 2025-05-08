// notification.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(userId: string, message: string, data: any): Promise<Notification> {
    const notification = new this.notificationModel({ userId, message, data });
    return notification.save();
  }

  async getNotificationsByUser(userId: string) {
    console.log("1111111");
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
  
  async markNotificationAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.notificationModel.updateMany({ userId }, { read: true });
  }
  
  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 }).exec();
  }
}
