import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '../../messaging/rabbitmq/repositories/rabbitmq.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { UsersModule } from '../../users.module';
import { User, UserSchema } from '../../entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule, HttpService } from '@nestjs/axios';
import { FileSystemService } from '../../provider/file-system.service';
import mongoose from 'mongoose';
import { FindUserByIdUseCase } from './findById-user.usecase';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

describe('CreateUserUseCase funtional', () => {
    let findUserByIdUseCase: FindUserByIdUseCase;
    let httpService: HttpService;

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
            providers: [FindUserByIdUseCase, UsersService, FileSystemService],
        }).compile();

        findUserByIdUseCase =
            moduleRef.get<FindUserByIdUseCase>(FindUserByIdUseCase);

        httpService = moduleRef.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('find a user', () => {
        it('should delete a user by ID', async () => {
            const userId = 1;
            const userData = {
                _id: userId,
                name: 'John Doe',
                email: 'johndoe@example.com',
            };

            const axiosResponse: AxiosResponse = {
                data: userData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {
                    headers: undefined,
                },
            };

            jest.spyOn(httpService, 'get').mockReturnValueOnce(
                of(axiosResponse),
            );

            const result = await findUserByIdUseCase.execute(userId);

            expect(result).toEqual(userData);
            expect(httpService.get).toHaveBeenCalledWith(
                `https://reqres.in/api/users/${userId}`,
            );
        });
    });
});
