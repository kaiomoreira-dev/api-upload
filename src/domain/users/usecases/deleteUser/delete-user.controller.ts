import {
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Inject,
    Param,
} from '@nestjs/common';
import { DeleteUserByIdUseCase } from './delete-user.usecase';

@Controller('/api/users/:id')
export class DeleteUserByIdController {
    constructor(
        @Inject(DeleteUserByIdUseCase)
        private readonly deleteUserByIdUseCase: DeleteUserByIdUseCase,
    ) {}

    @Delete()
    findById(@Param('id') id: string) {
        try {
            return this.deleteUserByIdUseCase.execute(id);
        } catch (error) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
    }
}
