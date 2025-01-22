import { Database } from "@/database";
import { CustomerModel } from "@/models/customer-model";
import { UserModel } from "@/models/user-model";

export class CustomerService {
  async register(customer: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) {
    const connection = await Database.getInstance().getConnection();

    const { name, email, password, phone, address } = customer;

    try {
      await connection.beginTransaction();

      const user = await UserModel.create(
        {
          name,
          email,
          password,
        },
        { connection }
      );

      const customer = await CustomerModel.create(
        {
          user_id: user.id,
          phone,
          address,
        },
        { connection }
      );

      await connection.commit();

      return { id: customer.id, user_id: user.id, phone, address };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}
