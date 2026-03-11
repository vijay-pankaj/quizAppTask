import models from "../../models/index.js";

const findUserByEmail = async (email) => {

    return await models.User.findOne({
        where: { email }
    })
}
const createUser = async (data) => {

  return await models.User.create(data);

};
export default {
    findUserByEmail,createUser
}