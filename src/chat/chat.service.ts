// chat.service.ts
import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schema/lead.schema';
import { ChatLog, ChatLogDocument } from './schema/chatlog.schema';
import { CreateLeadDto } from '../commons/dtos/create-lead.dto';
import { Faq, FaqDocument } from './schema/faq.schema';
import { getEmbedding, cosineSimilarity } from '../utils/embedding.util';

@Injectable()
export class ChatService {
  private transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_SUPPORT_USER,
      pass: process.env.SMTP_SUPPORT_PASS,
    },
  });

  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLogDocument>,
  ) {}

  async getBotResponse(userMessage: string): Promise<string> {
    const message = userMessage.toLowerCase().trim();

    if (message.includes('talk to representative')) {
      return 'Please provide your name, email, and phone number so we can connect you with our team.';
    }

    const faqs = await this.faqModel.find();
    const userVector = await getEmbedding(message);

    let bestMatch = null;
    let highestSim = 0;

    for (const faq of faqs) {
      if (!faq.vector) {
        const rawVector = await getEmbedding(faq.question);
        const vector = Array.from(rawVector);
        await this.faqModel.updateOne({ _id: faq._id }, { $set: { vector } });
        faq.vector = vector;
      }

      const sim = cosineSimilarity(userVector, faq.vector);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = faq;
      }
    }

    if (bestMatch && highestSim >= 0.75) {
      return bestMatch.answer;
    }

    return "Sorry, I didn't get that. Please try rephrasing or type 'Talk to representative'.";
  }

  async saveLead(leadDto: CreateLeadDto): Promise<Lead> {
    const newLead = new this.leadModel(leadDto);
    const savedLead = await newLead.save();

    // Send notification email
    await this.transporter.sendMail({
      from: process.env.SMTP_SUPPORT_USER,
      to: 'admin@glimmer.com.pk', // send to yourself
      subject: 'New Lead Submitted',
      html: this.generateLeadEmailHtml(leadDto),
    });

    return savedLead;
  }

  private generateLeadEmailHtml(lead: CreateLeadDto): string {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f1f1f; padding: 24px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="border-bottom: 2px solid #4b0082; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: #4b0082; margin: 0;">New Lead Notification</h2>
        <p style="margin: 4px 0; font-size: 14px; color: #555;">Submitted via Chatbot</p>
      </div>
      <table style="width: 100%; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0;"><strong> Name:</strong></td>
          <td>${lead.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong> Email:</strong></td>
          <td>${lead.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong> Phone:</strong></td>
          <td>${lead.phone}</td>
        </tr>
      </table>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 14px; color: #777;">You received this lead through your automated chatbot system. Please follow up as soon as possible.</p>
    </div>
  `;
  }

  async saveChatLog(sessionId: string, message: string, from: string) {
    const log = new this.chatLogModel({ sessionId, message, from });
    return log.save();
  }
}
