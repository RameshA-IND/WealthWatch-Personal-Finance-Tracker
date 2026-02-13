import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'WealthWatch API is Running! Please visit the Frontend URL to login.';
  }
}