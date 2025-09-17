import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('Meta') // ✅ Groups all endpoints under "Meta" in Swagger
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('feed')
  @ApiOperation({
    summary: 'Get Meta Product Feed',
    description: 'Returns all active products formatted for Meta Catalog feed',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of products in Meta-compatible format',
    schema: {
      example: [
        {
          id: '683d672c2a966f9cbae72cc1',
          title: 'Pack Of 5 Soaps',
          description: 'All Soap is a scientifically-formulated soap...',
          availability: 'in stock',
          condition: 'new',
          price: '468 PKR',
          sale_price: '585 PKR',
          image_link: 'https://glimmer.com.pk/glimmer/brands/.../soap.webp',
          link: 'https://glimmer.com.pk/skin-care/cleansers/soap/pack-of-5-soaps?id=683d672c2a966f9cbae72cc1&storeId=6798f7e7d9fa7ab0a8a9aaf8',
          quantity: 50,
          brand: 'Glimmer',
        },
      ],
    },
  })
  async getFeed() {
    return this.metaService.getProductFeed();
  }
}
