const { CustomerModel } = require("../models");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");
const { getAsync, setAsync } = require("../redis");
//Dealing with data base operations
class CustomerRepository {
  async CreateCustomer({ username, email, password, salt }) {
    try {
      const customer = new CustomerModel({
        username,
        email,
        password,
        salt,
      });
      const customerResult = await customer.save();
      return customerResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }
  async UpdateCustomer({ id, update }) {
    try {
      const customer = await CustomerModel.findById(id);
      if (customer) {
        Object.keys(update).map((key) => {
          customer[key] = update[key];
        });
        const customerResult = await customer.save();
        return customerResult;
      }
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Update Customer"
      );
    }
  }
  async FindCustomer({ email }) {
    try {
      const cacheKey = `user:${email}`;
      // Try to get the user from Redis cache
      let user = await getAsync(cacheKey);

      if (user) {
        console.log('Retrieved user from cache');
        console.log(JSON.parse(user));
        // return;
      }
      const existingCustomer = await CustomerModel.findOne({ email: email });
      await setAsync(cacheKey, JSON.stringify(existingCustomer));
      console.log('Retrieved user from database');
      return existingCustomer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async FindCustomerById({ id }) {
    try {      
      const existingCustomer = await CustomerModel.findById(id);
      return existingCustomer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async Wishlist(customerId) {
    try {
      const profile = await CustomerModel.findById(customerId)

      return profile.wishlist;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Wishlist "
      );
    }
  }
  async AddWishlistItem(customerId, { _id, name, price, color, imageCover, size, brand }) {
    const product = { _id, name, price, color, imageCover, size, brand };
    try {
      const profile = await CustomerModel.findById(customerId);

      if (profile) {
        let wishlist = profile.wishlist;

        if (wishlist.length > 0) {
          let isExist = false;
          wishlist.forEach((item) => {
            if (item._id.toString() === product._id.toString()) {
              const index = wishlist.indexOf(item);
              wishlist.splice(index, 1);
              isExist = true;
            }
          });

          if (!isExist) {
            wishlist.push(product);
          }
        } else {
          wishlist.push(product);
        }

        profile.wishlist = wishlist;
      }

      const profileResult = await profile.save();

      return profileResult.wishlist;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Add to WishList"
      );
    }
  }

  async AddCartItem(customerId, { _id, name, price, imageCover, size, color, brand }, qty, isRemove) {
    try {
      const profile = await CustomerModel.findById(customerId);
      if (profile) {
        const cartItem = {
          product: { _id, name, price, imageCover, size, color, brand },
          unit: qty,
        };
        let cartItems = profile.cart;

        if (cartItems.length > 0) {
          let isExist = false;
          cartItems.forEach((item) => {
            if (item.product._id.toString() === cartItem.product._id.toString()) {
              if (isRemove) {
                cartItems.splice(cartItems.indexOf(item), 1);
              } else {
                item.unit = qty;
              }
              isExist = true;
            }
          });

          if (!isExist) {
            cartItems.push(cartItem);
          }
        } else {
          cartItems.push(cartItem);
        }
        profile.cart = cartItems;

        const cartSaveResult = await profile.save();

        return cartSaveResult.cart;
      }

      throw new Error("Unable to add to cart!");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async AddOrderToProfile(customerId, order) {
    try {
      const profile = await CustomerModel.findById(customerId);

      if (profile) {
        if (profile.orders == undefined) {
          profile.orders = [];
        }
        profile.orders.push(order);

        profile.cart = [];

        const profileResult = await profile.save();

        return profileResult;
      }

      throw new Error("Unable to add to order!");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }
}

module.exports = CustomerRepository;
