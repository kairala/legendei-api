import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Caption } from '../../../db/schemas/caption.schema';

@Injectable()
export class CaptionService {
  constructor(
    @InjectModel(Caption.name)
    private readonly captionModel: Model<Caption>,
  ) {}

  list({ userId }: { userId: ObjectId }) {
    return this.captionModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }
}
