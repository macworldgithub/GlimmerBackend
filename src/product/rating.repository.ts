import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from '../schemas/ecommerce/rating.schema';

@Injectable()
export class RatingRepository {
  constructor(
    @InjectModel(Rating.name) private rating_model: Model<RatingDocument>,
  ) {}

  async create_rating(rating_data: {
    productId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
  }) {
    const rating = new this.rating_model(rating_data);
    return rating.save();
  }

  async get_user_rating(productId: Types.ObjectId, userId: Types.ObjectId) {
    return this.rating_model
      .findOne({ productId, userId }, { rating: 1 })
      .exec();
  }

  async get_product_ratings(productId: Types.ObjectId) {
    return this.rating_model
      .find({ productId })
      .populate('userId', 'name email')
      .exec();
  }

  async update_rating(ratingId: Types.ObjectId, rating: number) {
    return this.rating_model
      .findByIdAndUpdate(
        ratingId,
        { rating },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async get_rating_stats(productId: Types.ObjectId) {
    const stats = await this.rating_model
      .aggregate([
        { $match: { productId } },
        {
          $group: {
            _id: null,
            total_ratings: { $sum: 1 },
            average_rating: { $avg: '$rating' },
            rating_distribution: {
              $push: {
                rating: '$rating',
              },
            },
          },
        },
        {
          $project: {
            total_ratings: 1,
            average_rating: { $round: ['$average_rating', 2] },
            rating_distribution: {
              five: {
                $size: {
                  $filter: {
                    input: '$rating_distribution',
                    as: 'item',
                    cond: { $eq: ['$$item.rating', 5] },
                  },
                },
              },
              four: {
                $size: {
                  $filter: {
                    input: '$rating_distribution',
                    as: 'item',
                    cond: { $eq: ['$$item.rating', 4] },
                  },
                },
              },
              three: {
                $size: {
                  $filter: {
                    input: '$rating_distribution',
                    as: 'item',
                    cond: { $eq: ['$$item.rating', 3] },
                  },
                },
              },
              two: {
                $size: {
                  $filter: {
                    input: '$rating_distribution',
                    as: 'item',
                    cond: { $eq: ['$$item.rating', 2] },
                  },
                },
              },
              one: {
                $size: {
                  $filter: {
                    input: '$rating_distribution',
                    as: 'item',
                    cond: { $eq: ['$$item.rating', 1] },
                  },
                },
              },
            },
          },
        },
      ])
      .exec();
    return stats[0] || {
      total_ratings: 0,
      average_rating: 0,
      rating_distribution: { five: 0, four: 0, three: 0, two: 0, one: 0 },
    };
  }
}