import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../../repositories/implementations/users.service';
import { FileSystemService } from '../../provider/file-system.service';

@Injectable()
export class DeleteUserByIdUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly fileSystemService: FileSystemService,
    ) {}

    async execute(id: string): Promise<any> {
        const user = await this.usersService.findById(id);

        if (!user) {
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
        }

        this.fileSystemService.deleteImage(
            process.env.PATH_IMAGE,
            user.avatarName,
        );

        return this.usersService.deleteById(id);
    }
}
