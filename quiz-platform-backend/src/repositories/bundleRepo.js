import { Op } from "sequelize";
import Bundle from "../../models/bundle.js";

const createBundle = async (data) => {
  return await Bundle.create(data);
};

const getBundles = async (clientId, page, limit, search) => {

  const offset = (page - 1) * limit;

  const where = {
    client_id: clientId,
  };

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`,
    };
  }

  const result = await Bundle.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return result;
};

export default {
  createBundle,
  getBundles,
};