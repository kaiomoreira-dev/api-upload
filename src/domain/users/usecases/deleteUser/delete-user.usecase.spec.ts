import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '../../messaging/rabbitmq/repositories/rabbitmq.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { UsersModule } from '../../users.module';
import { User, UserSchema } from '../../entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { DeleteUserByIdUseCase } from './delete-user.usecase';
import { FileSystemService } from '../../provider/file-system.service';
import mongoose from 'mongoose';

describe('CreateUserUseCase funtional', () => {
    let deleteUserByIdUseCase: DeleteUserByIdUseCase;
    let usersService: UsersService;
    let fileSystemService: FileSystemService;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
                MongooseModule.forRoot(process.env.MONGODB_URL),
                HttpModule,
            ],
            providers: [DeleteUserByIdUseCase, UsersService, FileSystemService],
        }).compile();

        deleteUserByIdUseCase = moduleRef.get<DeleteUserByIdUseCase>(
            DeleteUserByIdUseCase,
        );
        usersService = moduleRef.get<UsersService>(UsersService);
        fileSystemService = moduleRef.get<FileSystemService>(FileSystemService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('delete a user', () => {
        it('should delete a user by ID', async () => {
            const userId = '123';

            const deleteImageSpy = jest.spyOn(fileSystemService, 'deleteImage');
            const deleteByIdSpy = jest.spyOn(usersService, 'deleteById');

            jest.spyOn(usersService, 'findById').mockResolvedValueOnce({
                _id: userId,
                name: 'John Doe',

                email: 'johndoe@example.com',
                avatarName: 'avatar.jpg',
            });

            await deleteUserByIdUseCase.execute(userId);

            expect(deleteImageSpy).toHaveBeenCalledWith(
                process.env.PATH_IMAGE,
                'avatar.jpg',
            );
            expect(deleteByIdSpy).toHaveBeenCalledWith(userId);
        });

        it('should throw an error when user not found', async () => {
            const userId = '123';

            jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);

            await expect(
                deleteUserByIdUseCase.execute(userId),
            ).rejects.toThrowError('User Not Found');
        });
    });
});
