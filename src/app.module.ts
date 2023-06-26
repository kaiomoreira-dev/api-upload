import { Module } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URL), UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
