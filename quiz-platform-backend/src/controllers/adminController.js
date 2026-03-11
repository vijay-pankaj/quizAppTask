import adminService from "../services/adminService.js";

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

export default {
  createClient
};