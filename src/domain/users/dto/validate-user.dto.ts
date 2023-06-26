import {
    ArgumentMetadata,
    BadRequestException,
    PipeTransform,
} from '@nestjs/common';

export class ValidateIdParamsIsNumber implements PipeTransform<number, number> {
    transform(param: number, metadata: ArgumentMetadata) {
        if (param > 0 || typeof param === 'number') {
            return param;
        }
        throw new BadRequestException('Value Id params not valid.');
    }
}
