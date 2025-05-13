import { InjectModel } from '@nestjs/mongoose';
import { EProviders, User, UserDocument } from '../../db/schemas/user.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { IAuthValidateUserOutput } from '../types/validate.type';
import { CreateUserDto } from '../dto/signUp.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = new this.userModel({
      password: hashedPassword,
      email: user.email,
      verified: true,
      name: user.name,
    });

    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<IAuthValidateUserOutput> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException();
    }

    const passwordCompared = await bcrypt.compare(password, user.password);

    if (!passwordCompared) {
      throw new NotFoundException();
    }

    return {
      id: user._id,
      email: user.email,
    };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async findUserByProvider(
    email: string,
    provider: EProviders,
  ): Promise<User | null> {
    return this.userModel.findOne({ email, provider });
  }

  async update(id: ObjectId, data: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id);
  }

  async verifyUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { verified: true },
      { new: true },
    );
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserByIdAndUpdate(
    id: string,
    data: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async findUserByIdAndDelete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id);
  }
}
