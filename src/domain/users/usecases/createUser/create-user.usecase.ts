import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from '../../repositories/implementations/users.service';
import { RabbitMQService } from '../../messaging/rabbitmq/repositories/rabbitmq.service';

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMQService,
    ) {}

    async execute({ name, email, avatarUrl }: CreateUserDto): Promise<User> {
        const checkUserExists = await this.usersService.findByEmail(email);

        if (checkUserExists) {
            throw new HttpException(
                'User already exists',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const user = await this.usersService.create({
            name,
            email,
            avatarUrl,
        });

        // manda email para fila do rabbitmq
        this.rabbitMQService.sendMessage('rabbit-create-user', {
            message: email,
        });

        return user;
    }
}
