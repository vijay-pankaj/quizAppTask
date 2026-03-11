import models from "../../models/index.js";

const createClient = async (data) => {

  return await models.Client.create(data);

};

export default {
  createClient,
};