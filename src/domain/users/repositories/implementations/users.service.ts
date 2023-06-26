import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { IUserService } from '../user-service.interface';

@Injectable()
export class UsersService implements IUserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async create({
        email,
        avatarUrl,
        name,
        _id,
    }: CreateUserDto): Promise<User> {
        const user = new this.userModel({
            _id,
            email,
            avatarUrl,
            name,
            avatarBase64: null,
            avatarName: null,
        });

        return user.save();
    }

    async findById(id: string): Promise<User> {
        return this.userModel.findOne({ _id: id });
    }

    async findByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email: email });
    }
    async updateById(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        return this.userModel.findOneAndUpdate(
            { _id: id },
            { $set: updateUserDto },
            { new: true },
        );
    }
    async deleteById(id: string): Promise<any> {
        return this.userModel.deleteOne({ _id: id }).exec();
    }
}
