import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
} from '@nestjs/common';
import { FindUserByIdUseCase } from './findById-user.usecase';
import { ValidateIdParamsIsNumber } from '../../dto/validate-user.dto';

@Controller('/api/users/:id')
export class FindUserByIdController {
    constructor(
        @Inject(FindUserByIdUseCase)
        private readonly findUserByIdUseCase: FindUserByIdUseCase,
    ) {}

    @Get()
    findById(@Param('id', ValidateIdParamsIsNumber) id: number) {
        try {
            return this.findUserByIdUseCase.execute(id);
        } catch (error) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }
}
