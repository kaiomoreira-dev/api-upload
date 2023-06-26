import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UploadAvatarByUserIdUseCase } from './upload-avatar.usecase';

@Controller('/api/users/:id/avatar')
export class UploadAvatarByUserIdController {
    constructor(
        @Inject(UploadAvatarByUserIdUseCase)
        private readonly uploadAvatarByUserIdUseCase: UploadAvatarByUserIdUseCase,
    ) {}

    @Get()
    findById(@Param('id') id: string) {
        return this.uploadAvatarByUserIdUseCase.execute(id);
    }
}
