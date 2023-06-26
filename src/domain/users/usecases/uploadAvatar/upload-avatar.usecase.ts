import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemService } from '../../provider/file-system.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { User } from '../../entities/user.entity';

interface IAvatarUpload {
    avatarBase64: string;
}

@Injectable()
export class UploadAvatarByUserIdUseCase {
    constructor(
        private readonly fileSystemService: FileSystemService,
        private readonly usersService: UsersService,
    ) {}
    async execute(id: string, avatarNameJest?: string): Promise<User | string> {
        const user = await this.usersService.findById(id);

        if (!user) {
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
        }

        let avatarName = '';

        if (!avatarNameJest) {
            avatarName = `${uuidv4()}${user._id}avatar.jpg`;
        }

        avatarName = avatarNameJest;

        // const avatarNameHash = `${uuidv4()}${user._id}avatar.jpg`;

        if (
            this.fileSystemService.verifyAvatarUrl(
                process.env.PATH_IMAGE,
                user.avatarName,
            )
        ) {
            const avatar: IAvatarUpload = {
                avatarBase64: user.avatarBase64,
            };
            return avatar;
        }

        await this.fileSystemService.downloadAvatarImage(
            process.env.PATH_IMAGE,
            user.avatarUrl,
            avatarName,
        );

        const convertToBase64 =
            await this.fileSystemService.downloadImageToBase64(user.avatarUrl);

        await this.usersService.updateById(user._id, {
            avatarName,
            avatarBase64: convertToBase64,
        });

        return user;
    }
}
