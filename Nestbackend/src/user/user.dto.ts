import { IsNotEmpty } from "class-validator";

export class UserDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponseObject {
  id: string;
  username: string;
  created: Date;
  token?: string;
}
