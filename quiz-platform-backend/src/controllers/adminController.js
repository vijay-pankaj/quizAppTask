import adminService from "../services/adminService.js";
import models from "../../models/index.js";

const createClient = async (req, res) => {

  try {

    const client = await adminService.createClient(req.body);

    return res.status(201).json({
      success: true,
      data: client
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getAllClient = async (req, res) => {

  try {

    const clients = await models.Client.findAll();

    return res.status(200).json({
      success: true,
      data: clients
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getClientById = async (req, res) => {

  try {

    const client = await models.Client.findByPk(req.params.id);

    if (!client) {

      return res.status(404).json({
        success: false,
        message: "Client not found"
      });

    }

    return res.status(200).json({
      success: true,
      data: client
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export default {
  createClient,
  getAllClient,
  getClientById
};