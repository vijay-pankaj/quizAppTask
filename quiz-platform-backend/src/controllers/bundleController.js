import bundleService from "../services/bundleService.js";
import models from "../../models/index.js";

const createBundle = async (req, res) => {

  try {

    const userId = req.user.id;

    const client = await models.Client.findOne({
      where: { user_id: userId }
    });

    if (!client) {

      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });

    }

    const bundle = await bundleService.createBundle(req.body, client.id);

    return res.status(201).json({
      success: true,
      data: bundle
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getBundles = async (req, res) => {

  try {

    const bundles = await bundleService.getBundles(req.query);

    return res.status(200).json({
      success: true,
      data: bundles
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export default {
  createBundle,
  getBundles
};