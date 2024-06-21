const { ProductModel } = require("../models");
const { APIError, BadRequestError } = require("../../utils/app-errors");
const { getAsync, setAsync } = require("../redis");

//Dealing with data base operations
class ProductRepository {
  async CreateProduct({name,description,category,unit,price,inStock,brand,imageCover,size, images}) {
    try {
      const product = new ProductModel({name,description,category,unit,price,inStock,brand,imageCover,size, images});

      const productResult = await product.save();
      return productResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Product"
      );
    }
  }

  async Products() {
    try {
      return await ProductModel.find();
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Products"
      );
    }
  }

  async FindById(id) {
    try {
      const cachedProduct = `product:${id}`;
      const redisProduct = await getAsync(cachedProduct);
      if (redisProduct) {
        return JSON.parse(redisProduct);
      }
      const product = await ProductModel.findById(id);
      if (!product) {
        throw new BadRequestError("Product Not Found");
      }
      return await setAsync(cachedProduct, JSON.stringify(product));
      
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Product"
      );
    }
  }

  async FindByCategory(category) {
    try {
      const products = await ProductModel.find({ category: category });
      return products;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Category"
      );
    }
  }

  async FindSelectedProducts(selectedIds) {
    try {
      const products = await ProductModel.find()
        .where("_id")
        .in(selectedIds.map((_id) => _id))
        .exec();
      return products;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Product"
      );
    }
  }
}

module.exports = ProductRepository;
