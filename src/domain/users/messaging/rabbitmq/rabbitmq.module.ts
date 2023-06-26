import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './repositories/rabbitmq.service';
import 'dotenv/config';
@Module({
    imports: [
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
    ],
    controllers: [],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
