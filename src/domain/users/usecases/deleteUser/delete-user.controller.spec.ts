import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserByIdController } from './delete-user.controller';
import { DeleteUserByIdUseCase } from './delete-user.usecase';
import { UsersService } from '../../repositories/implementations/users.service';
import { FileSystemService } from '../../provider/file-system.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersModule } from '../../users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';

describe('DeleteUserByIdController', () => {
    let deleteUserByIdController: DeleteUserByIdController;
    let deleteUserByIdUseCase: DeleteUserByIdUseCase;
    let usersService: UsersService;
    let fileSystemService: FileSystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
                MongooseModule.forRoot(process.env.MONGODB_URL),
            ],
            controllers: [DeleteUserByIdController],
            providers: [DeleteUserByIdUseCase, UsersService, FileSystemService],
        }).compile();

        deleteUserByIdController = module.get<DeleteUserByIdController>(
            DeleteUserByIdController,
        );
        deleteUserByIdUseCase = module.get<DeleteUserByIdUseCase>(
            DeleteUserByIdUseCase,
        );
        usersService = module.get<UsersService>(UsersService);
        fileSystemService = module.get<FileSystemService>(FileSystemService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('delete user by id', () => {
        it('should throw an HttpException if the user does not exist', async () => {
            const userId = '123';

            jest.spyOn(usersService, 'findById').mockResolvedValue(null);
            jest.spyOn(fileSystemService, 'deleteImage');

            await expect(
                deleteUserByIdController.findById(userId),
            ).rejects.toThrowError(
                new HttpException('User Not Found', HttpStatus.NOT_FOUND),
            );

            expect(usersService.findById).toHaveBeenCalledWith(userId);
            expect(fileSystemService.deleteImage).not.toHaveBeenCalled();
        });
    });
});
