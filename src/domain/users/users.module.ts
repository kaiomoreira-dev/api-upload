import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { User, UserSchema } from './entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { CreateUserController } from './usecases/createUser/create-user.controller';
import { FindUserByIdController } from './usecases/findUserById/findById-user.controller';
import { UploadAvatarByUserIdController } from './usecases/uploadAvatar/upload-avatar.controller';
import { DeleteUserByIdController } from './usecases/deleteUser/delete-user.controller';
import { UsersService } from './repositories/implementations/users.service';
import { RabbitMQService } from './messaging/rabbitmq/repositories/rabbitmq.service';
import { FileSystemService } from './provider/file-system.service';
import { CreateUserUseCase } from './usecases/createUser/create-user.usecase';
import { FindUserByIdUseCase } from './usecases/findUserById/findById-user.usecase';
import { UploadAvatarByUserIdUseCase } from './usecases/uploadAvatar/upload-avatar.usecase';
import { DeleteUserByIdUseCase } from './usecases/deleteUser/delete-user.usecase';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
    controllers: [
        CreateUserController,
        FindUserByIdController,
        UploadAvatarByUserIdController,
        DeleteUserByIdController,
    ],
    providers: [
        UsersService,
        RabbitMQService,
        FileSystemService,
        CreateUserUseCase,
        FindUserByIdUseCase,
        UploadAvatarByUserIdUseCase,
        DeleteUserByIdUseCase,
    ],
})
export class UsersModule {}
