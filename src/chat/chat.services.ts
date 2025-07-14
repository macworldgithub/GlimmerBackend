// chat.service.ts
import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schema/lead.schema';
import { ChatLog, ChatLogDocument } from './schema/chatlog.schema';
import { Faq, FaqDocument } from './schema/faq.schema';
import { CreateLeadDto } from 'src/commons/dtos/chat-lead.dto';
import {
  cosineSimilarity,
  getEmbedding,
  normalize,
} from 'src/utils/embedding.util';

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

  private normalize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  async getBotResponse(userMessage: string, keyword?: string): Promise<string> {
    const message = userMessage.toLowerCase().trim();
    const normalizedMsg = this.normalize(message).join(' ').trim();
    const faqs = await this.faqModel.find();

    // 1. Check for exact matches first
    const exactMatch = faqs.find(
      (faq) => this.normalize(faq.question).join(' ').trim() === normalizedMsg,
    );
    if (exactMatch) return exactMatch.answer;

    // 2. Process keyword matching (with higher priority)
    if (keyword) {
      const normalizedKeyword = this.normalize(keyword).join(' ').trim();

      // First look for exact keyword matches in any FAQ's keywords
      const keywordExactMatch = faqs.find((faq) =>
        faq.keywords?.some(
          (k) => this.normalize(k).join(' ').trim() === normalizedKeyword,
        ),
      );
      if (keywordExactMatch) return keywordExactMatch.answer;

      // Then look for partial keyword matches
      const keywordPartialMatches = faqs.filter((faq) =>
        faq.keywords?.some(
          (k) =>
            this.normalize(k).join(' ').trim().includes(normalizedKeyword) ||
            normalizedKeyword.includes(this.normalize(k).join(' ').trim()),
        ),
      );

      // If we found multiple partial matches, return the one with the most specific match
      if (keywordPartialMatches.length > 0) {
        // Sort by match specificity (longer keywords are more specific)
        keywordPartialMatches.sort((a, b) => {
          const aMaxLen = Math.max(...(a.keywords || []).map((k) => k.length));
          const bMaxLen = Math.max(...(b.keywords || []).map((k) => k.length));
          return bMaxLen - aMaxLen;
        });
        return keywordPartialMatches[0].answer;
      }
    }

    // 3. Semantic similarity fallback
    const userVector = await getEmbedding(message);
    let bestMatch: Faq | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      if (!faq.vector) {
        const vector = await getEmbedding(faq.question.toLowerCase().trim());
        await this.faqModel.updateOne({ _id: faq._id }, { $set: { vector } });
        faq.vector = vector;
      }

      const similarityScore = cosineSimilarity(userVector, faq.vector);

      // Apply keyword bonus if relevant
      let keywordBonus = 0;
      if (keyword && faq.keywords?.length) {
        const normalizedKeyword = this.normalize(keyword).join(' ');
        const hasKeywordMatch = faq.keywords.some((k) =>
          this.normalize(k).join(' ').includes(normalizedKeyword),
        );
        if (hasKeywordMatch) keywordBonus = 0.3;
      }

      const finalScore = similarityScore + keywordBonus;

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = faq;
      }
    }

    // 4. Return the best result available
    if (bestMatch && highestScore >= 0.65) return bestMatch.answer;

    // 5. Fallback responses
    if (keyword) {
      return `We offer services related to "${keyword}". Could you be more specific about what you're looking for?`;
    }

    return "We offer various salon services including makeup, haircuts, and skincare. Could you specify which service you're interested in?";
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
