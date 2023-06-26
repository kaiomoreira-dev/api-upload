import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class RabbitMQService {
    constructor(
        @Inject('rabbit-mq-module') private readonly client: ClientProxy,
    ) {}

    public async sendMessage(pattern: string, data: any): Promise<void> {
        await lastValueFrom(this.client.send(pattern, data));
    }
}
