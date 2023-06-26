import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import { CreateUserDto } from '../../dto/create-user.dto';

@Controller('/api/users')
export class CreateUserController {
    constructor(
        @Inject(CreateUserUseCase)
        private readonly createUserUseCase: CreateUserUseCase,
    ) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        try {
            return this.createUserUseCase.execute(createUserDto);
        } catch {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }
}
