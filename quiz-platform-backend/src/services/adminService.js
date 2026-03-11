import bcrypt from "bcrypt";
import clientRepo from "../repositories/clientRepo.js";
import userRepo from "../repositories/userRepo.js";

const createClient = async (data) => {

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await userRepo.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role_id: 2
  });

  const client = await clientRepo.createClient({
    user_id: user.id,
    company_name: data.company_name,
    contact_number: data.contact_number
  });

  return client;
};


export default {
  createClient
};