import { Op } from "sequelize";
import models from "../../models/index.js";

const createBundle = async (data, transaction = null) => {

  return await models.Bundle.create(data, { transaction });

};

const getBundles = async (page = 1, limit = 10, search = null) => {

  const offset = (page - 1) * limit;

  const where = {};

  if (search) {

    where.title = {
      [Op.like]: `%${search}%`
    };

  }

  const result = await models.Bundle.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;

};

export default {
  createBundle,
  getBundles
};