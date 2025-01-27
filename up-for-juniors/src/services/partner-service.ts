import { Database } from "../database";
import { PartnerModel } from "../models/partner-model";
import { UserModel } from "../models/user-model";

export class PartnerService {
  async register(partner: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = partner;

    const connection = await Database.getInstance().getConnection();

    try {
      await connection.beginTransaction();

      const user = await UserModel.create({
        name,
        email,
        password,
      }, {connection});

      const partner = await PartnerModel.create({
        user_id: user.id,
        company_name,
      }, {connection});

      await connection.commit();

      return { id: partner.id, user_id: user.id, company_name };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUserId(user_id: string) {
    return PartnerModel.findByUserId(user_id);
  }
}
