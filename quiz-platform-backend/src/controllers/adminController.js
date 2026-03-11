import adminService from "../services/adminService.js";
import models from "../../models/index.js";
const createClient = async (req, res) => {

  try {

    const client = await adminService.createClient(req.body);

    res.status(201).json({
      success: true,
      data: client
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getAllClient = async(req,res)=>{
  try{
    const client = await models.Client.findAll()
     res.status(201).json(
      client
    );
  }catch(error){
     res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
export default {
  createClient,
  getAllClient
};