import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    _id?: string;

    @IsNotEmpty({ message: 'Name is empty' })
    name: string;

    @IsNotEmpty({ message: 'Email is empty' })
    email: string;

    @IsNotEmpty({ message: 'AvatarUrl is empty' })
    avatarUrl: string;

    avatarName?: string;
    avatarBase64?: string;
}
