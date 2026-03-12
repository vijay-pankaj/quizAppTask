import bcrypt from "bcrypt";
import sequelize from "../config/sequelizeConfig.js";
import clientRepo from "../repositories/clientRepo.js";
import userRepo from "../repositories/userRepo.js";
import dashboardRepo from "../repositories/dashboardRepo.js";

const createClient = async (data) => {

  const transaction = await sequelize.transaction();

  try {

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role_id: 2
      },
      transaction
    );

    const client = await clientRepo.createClient(
      {
        user_id: user.id,
        company_name: data.company_name,
        contact_number: data.contact_number
      },
      transaction
    );

    await transaction.commit();

    return client;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};

const getDashboard = async () => {

  const stats = await dashboardRepo.getDashboardStats();

  return stats;

};

export default {
  createClient,
  getDashboard
};