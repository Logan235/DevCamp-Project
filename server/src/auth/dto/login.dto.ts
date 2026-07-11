import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be email' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'password should not be empty' })
  password!: string;
}
