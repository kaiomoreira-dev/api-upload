import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemService } from '../../provider/file-system.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { User, UserSchema } from '../../entities/user.entity';
import { UploadAvatarByUserIdUseCase } from './upload-avatar.usecase';
import { UsersModule } from '../../users.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('UploadAvatarByUserIdUseCase', () => {
    let uploadAvatarByUserIdUseCase: UploadAvatarByUserIdUseCase;
    let fileSystemService: FileSystemService;
    let usersService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
                MongooseModule.forRoot(process.env.MONGODB_URL),
            ],
            providers: [
                UploadAvatarByUserIdUseCase,
                FileSystemService,
                UsersService,
            ],
        }).compile();

        uploadAvatarByUserIdUseCase = module.get<UploadAvatarByUserIdUseCase>(
            UploadAvatarByUserIdUseCase,
        );
        fileSystemService = module.get<FileSystemService>(FileSystemService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = '123';
        const avatarUrl = 'https://reqres.in/img/faces/2-image.jpg';

        it('should upload an avatar for a user', async () => {
            const user: User = {
                _id: userId,
                avatarBase64: null,
                avatarName: 'avatar.jpg',
                avatarUrl,
                email: 'johndoe@example.com',
                name: 'John Doe',
            };

            const avatarName = `${uuidv4()}${user._id}avatar.jpg`;
            jest.spyOn(usersService, 'findById').mockResolvedValue(user);
            jest.spyOn(fileSystemService, 'verifyAvatarUrl').mockReturnValue(
                false,
            );
            jest.spyOn(fileSystemService, 'downloadAvatarImage');
            jest.spyOn(
                fileSystemService,
                'downloadImageToBase64',
            ).mockResolvedValue('base64data');
            jest.spyOn(usersService, 'updateById').mockResolvedValue(user);

            const result = await uploadAvatarByUserIdUseCase.execute(
                user._id,
                avatarName,
            );

            expect(usersService.findById).toHaveBeenCalledWith(user._id);
            expect(fileSystemService.verifyAvatarUrl).toHaveBeenCalledWith(
                process.env.PATH_IMAGE,
                user.avatarName,
            );
            expect(fileSystemService.downloadAvatarImage).toHaveBeenCalledWith(
                process.env.PATH_IMAGE,
                user.avatarUrl,
                avatarName,
            );
            expect(
                fileSystemService.downloadImageToBase64,
            ).toHaveBeenCalledWith(user.avatarUrl);
            expect(usersService.updateById).toHaveBeenCalledWith(user._id, {
                avatarName,
                avatarBase64: 'base64data',
            });
            expect(result).toEqual(user);
        });

        it('should return the base64 avatar if it already exists', async () => {
            const user: User = {
                _id: userId,
                avatarBase64: 'base64data',
                avatarName: 'avatar.jpg',
                avatarUrl,
                email: 'johndoe@example.com',
                name: 'John Doe',
            };

            jest.spyOn(usersService, 'findById').mockResolvedValue(user);
            jest.spyOn(fileSystemService, 'verifyAvatarUrl').mockReturnValue(
                true,
            );

            const result = await uploadAvatarByUserIdUseCase.execute(userId);

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(fileSystemService.verifyAvatarUrl).toHaveBeenCalledWith(
                process.env.PATH_IMAGE,
                user.avatarName,
            );
            expect(result).toEqual({ avatarBase64: user.avatarBase64 });
        });

        it('should throw an HttpException if the user does not exist', async () => {
            jest.spyOn(usersService, 'findById').mockResolvedValue(null);

            await expect(
                uploadAvatarByUserIdUseCase.execute(userId),
            ).rejects.toThrowError(
                new HttpException('User Not Found', HttpStatus.NOT_FOUND),
            );
        });
    });
});
