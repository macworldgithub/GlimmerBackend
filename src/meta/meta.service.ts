import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Product } from 'src/schemas/ecommerce/product.schema';
import { S3Service } from 'src/aws/s3.service';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  private readonly pixelId = process.env.META_PIXEL_ID;
  private readonly accessToken = process.env.META_ACCESS_TOKEN;

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private s3_service: S3Service,
  ) {}

  // ✅ Slugify product name
  formatSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with -
      .replace(/-+/g, '-') // collapse multiple -
      .replace(/^-+|-+$/g, ''); // trim - from start/end
  }

  // ✅ Build product URL
  async MakeUrlForProductForMeta(productId: string) {
    const result = await this.productModel
      .findById(productId)
      .populate('category')
      .populate('sub_category')
      .populate('item')
      .lean();

    if (!result) return null;

    //@ts-ignore
    const category = result.category?.slug || 'category';
    //@ts-ignore

    const sub_category = result.sub_category?.slug || 'sub-category';
    //@ts-ignore

    const item = result.item?.slug || 'item';
    const productSlug = this.formatSlug(result.name);

    return `https://glimmer.com.pk/${category}/${sub_category}/${item}/${productSlug}?id=${productId}&storeId=${result.store}`;
  }

  // ✅ Generate Meta Feed
  async getProductFeed() {
    const products = await this.productModel.find({ status: 'Active' });

    return Promise.all(
      products.map(async (p) => ({
        id: p._id.toString(),
        title: p.name,
        description: p.description,

        price: `${p.discounted_price} PKR`,
        sale_price: `${p.base_price} PKR`,
        //@ts-ignore
        image_link:
          p?.image1 && p.image1.trim()
            ? await this.s3_service.get_image_url(p.image1)
            : '',

        link: await this.MakeUrlForProductForMeta(p._id.toString()),

        brand: 'Glimmer',
      })),
    );
  }

  async sendProductCreated(product: any) {
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${this.pixelId}/events?access_token=${this.accessToken}`,
        {
          data: [
            {
              event_name: 'ProductCreated',
              event_time: Math.floor(Date.now() / 1000),
              custom_data: {
                content_ids: [product._id.toString()],
                content_type: 'product',

                currency: 'PKR',
                title: product.name,
                description: product.description,
                image_link: product.image1 || '',
                price: `${product.discounted_price} PKR`,
                sale_price: `${product.base_price} PKR`,
              },
            },
          ],
        },
      );

      this.logger.log(`Meta event sent: ProductCreated for ${product._id}`);
    } catch (err) {
      this.logger.error(
        'Failed to send ProductCreated event',
        //@ts-ignore
        err.response?.data || err.message,
      );
    }
  }

  // meta.service.ts
  async sendProductUpdated(product: any) {
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${this.pixelId}/events?access_token=${this.accessToken}`,
        {
          data: [
            {
              event_name: 'ProductUpdated',
              event_time: Math.floor(Date.now() / 1000),
              custom_data: {
                content_ids: [product._id.toString()],
                content_type: 'product',

                currency: 'PKR',
                title: product.name,
                description: product.description,
                image_link: product.image1 || '',
                price: `${product.discounted_price} PKR`,
                sale_price: `${product.base_price} PKR`,
              },
            },
          ],
        },
      );

      this.logger.log(`Meta event sent: ProductUpdated for ${product._id}`);
    } catch (err) {
      this.logger.error(
        'Failed to send ProductUpdated event',
        //@ts-ignore
        err.response?.data || err.message,
      );
    }
  }
}
