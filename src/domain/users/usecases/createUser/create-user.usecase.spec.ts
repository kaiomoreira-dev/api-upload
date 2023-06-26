import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '../../messaging/rabbitmq/repositories/rabbitmq.service';
import { UsersService } from '../../repositories/implementations/users.service';
import { CreateUserUseCase } from './create-user.usecase';
import { UsersModule } from '../../users.module';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User, UserSchema } from '../../entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CreateUserUseCase funtional', () => {
    let createUserUseCase: CreateUserUseCase;
    let usersService: UsersService;
    let rabbitMQService: RabbitMQService;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
                MongooseModule.forRoot(process.env.MONGODB_URL),
                ClientsModule.register([
                    {
                        name: 'rabbit-mq-module',
                        transport: Transport.RMQ,
                        options: {
                            urls: [process.env.RABBITMQ_URL],
                            queue: 'rabbit-create-user',
                        },
                    },
                ]),
                HttpModule,
            ],
            providers: [CreateUserUseCase, UsersService, RabbitMQService],
        }).compile();

        createUserUseCase = moduleRef.get<CreateUserUseCase>(CreateUserUseCase);
        usersService = moduleRef.get<UsersService>(UsersService);
        rabbitMQService = moduleRef.get<RabbitMQService>(RabbitMQService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create a user', () => {
        it('should create a user and send a message to RabbitMQ', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            const createdUser: User = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
            jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);
            jest.spyOn(rabbitMQService, 'sendMessage');

            const result = await createUserUseCase.execute(createUserDto);

            expect(usersService.findByEmail).toHaveBeenCalledWith(
                createUserDto.email,
            );
            expect(usersService.create).toHaveBeenCalledWith(createUserDto);

            expect(rabbitMQService.sendMessage).toHaveBeenCalledWith(
                'rabbit-create-user',
                { message: createUserDto.email },
            );
            expect(result).toEqual(createdUser);
        });

        it('should throw an HttpException if the user already exists', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
                name: 'Existing User',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            });

            await expect(
                createUserUseCase.execute(createUserDto),
            ).rejects.toThrowError(
                new HttpException(
                    'User already exists',
                    HttpStatus.UNAUTHORIZED,
                ),
            );
        });
    });
});
