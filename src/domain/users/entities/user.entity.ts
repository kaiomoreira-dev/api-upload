import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
    @Prop({ default: new mongoose.Types.ObjectId() })
    _id?: string;

    @Prop()
    name?: string;

    @Prop()
    email?: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ default: null })
    avatarName?: string;

    @Prop({ default: null })
    avatarBase64?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
