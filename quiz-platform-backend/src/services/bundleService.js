import bundleRepo from "../repositories/bundleRepo.js";

const createBundle = async (data, clientId) => {

  const bundle = await bundleRepo.createBundle({
    client_id: clientId,
    title: data.title,
    description: data.description,
  });

  return bundle;
};

const getBundles = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || "";

  const result = await bundleRepo.getBundles(page, limit, search);

  return {
    totalRecords: result.count,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
    bundles: result.rows,
  };
};

export default {
  createBundle,
  getBundles,
};