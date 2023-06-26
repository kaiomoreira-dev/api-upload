import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UploadAvatarByUserIdUseCase } from './upload-avatar.usecase';
import { FileSystemService } from '../../provider/file-system.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { UploadAvatarByUserIdController } from './upload-avatar.controller';
import { UsersModule } from '../../users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';

describe('UploadAvatarController', () => {
    let uploadAvatarByUserIdController: UploadAvatarByUserIdController;
    let uploadAvatarByUserIdUseCase: UploadAvatarByUserIdUseCase;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
                MongooseModule.forRoot(process.env.MONGODB_URL),
            ],
            controllers: [UploadAvatarByUserIdController],
            providers: [
                UploadAvatarByUserIdUseCase,
                FileSystemService,
                UsersService,
            ],
        }).compile();

        uploadAvatarByUserIdController =
            module.get<UploadAvatarByUserIdController>(
                UploadAvatarByUserIdController,
            );
        uploadAvatarByUserIdUseCase = module.get<UploadAvatarByUserIdUseCase>(
            UploadAvatarByUserIdUseCase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadAvatar', () => {
        const userId = '123';
        const avatarName = 'avatar.jpg';

        it('should upload an avatar for a user', async () => {
            const user = {
                _id: userId,
                avatarBase64: null,
                avatarName,
                avatarUrl: 'https://reqres.in/img/faces/2-image.jpg',
                email: 'johndoe@example.com',
                name: 'John Doe',
            };

            jest.spyOn(
                uploadAvatarByUserIdUseCase,
                'execute',
            ).mockResolvedValue(user);

            const result = await uploadAvatarByUserIdController.findById(
                userId,
            );

            expect(uploadAvatarByUserIdUseCase.execute).toHaveBeenCalledWith(
                userId,
            );
            expect(result).toEqual(user);
        });

        it('should handle error if user is not found', async () => {
            jest.spyOn(
                uploadAvatarByUserIdUseCase,
                'execute',
            ).mockRejectedValue(
                new HttpException('User Not Found', HttpStatus.NOT_FOUND),
            );

            await expect(
                uploadAvatarByUserIdController.findById(userId),
            ).rejects.toThrow(
                new HttpException('User Not Found', HttpStatus.NOT_FOUND),
            );
            expect(uploadAvatarByUserIdUseCase.execute).toHaveBeenCalledWith(
                userId,
            );
        });
    });
});
