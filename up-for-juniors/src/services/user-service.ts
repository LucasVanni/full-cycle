import { UserModel } from "../models/user-model";

export class UserService {
  async findById(id: string) {
    return UserModel.findById(id);
  }

  async findByEmail(email: string) {
    return UserModel.findByEmail(email);
  }
}
