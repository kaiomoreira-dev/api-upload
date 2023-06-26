import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User, UserSchema } from '../../entities/user.entity';
import { UsersService } from '../../repositories/implementations/users.service';
import { RabbitMQService } from '../../messaging/rabbitmq/repositories/rabbitmq.service';
import { CreateUserUseCase } from './create-user.usecase';
import { CreateUserController } from './create-user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../../users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';

describe('CreateUserController', () => {
    let createUserController: CreateUserController;
    let createUserUseCase: CreateUserUseCase;
    let usersService: UsersService;
    let rabbitMQService: RabbitMQService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
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
            controllers: [CreateUserController],
            providers: [CreateUserUseCase, UsersService, RabbitMQService],
        }).compile();

        createUserController =
            module.get<CreateUserController>(CreateUserController);
        createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        usersService = module.get<UsersService>(UsersService);
        rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create user', () => {
        it('should create a user and send a message to RabbitMQ', async () => {
            const createUserDto: CreateUserDto = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            const createdUser: User = {
                _id: '123',
                name: 'John Doe',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            };

            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
            jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);
            jest.spyOn(rabbitMQService, 'sendMessage');

            const result = await createUserController.create(createUserDto);

            expect(usersService.findByEmail).toHaveBeenCalledWith(
                createUserDto.email,
            );
            expect(usersService.create).toHaveBeenCalledWith(createUserDto);

            expect(rabbitMQService.sendMessage).toHaveBeenCalledWith(
                'rabbit-create-user',
                {
                    message: createUserDto.email,
                },
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
                _id: '456',
                name: 'Existing User',
                email: 'johndoe@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
            });

            await expect(
                createUserController.create(createUserDto),
            ).rejects.toThrowError(
                new HttpException(
                    'User already exists',
                    HttpStatus.UNAUTHORIZED,
                ),
            );
        });
    });
});
