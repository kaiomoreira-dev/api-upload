import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class FindUserByIdUseCase {
    constructor(private readonly httpService: HttpService) {}

    async execute(id: number): Promise<User> {
        const user = (await lastValueFrom(
            this.httpService
                .get(`https://reqres.in/api/users/${id}`)
                .pipe(map((res) => res.data)),
        )) as User;

        return user;
    }
}
