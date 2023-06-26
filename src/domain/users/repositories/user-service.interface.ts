import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUserService {
    create(createUserDto: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    updateById(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deleteById(id: string): Promise<any>;
}
