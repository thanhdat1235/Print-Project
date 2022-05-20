const User = require("../../model/user");
const bcryptjs = require("bcryptjs");
const statusAPI = require("../../utils/statusAPI");

const {
  redisClient,
  generateToken,
  destroyToken,
} = require("../../middleware/jwt");

let randomFixedInteger = function (length) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );
};

class AdminController {
  // REGISTER
  async register(req, res) {
    try {
      const { first_name, last_name, email, password, gender, address, role } =
        req.body;

      if (!email || !password || !first_name || !last_name || role) {
        return res.status(400).send("All input is required");
      }

      const oldUser = await User.findOne({ email });
      if (oldUser) {
        return res.status(409).send({ messages: "Email already exists" });
      }
      const encryptedPassword = await bcryptjs.hash(password, 10);
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        created_at: new Date(),
        gender: "other",
        address: "",
        otp_code: null,
        role: "user",
      });
      if (!user) {
        return res.status(404).send({ message: "Create account failed" });
      }
      console.log(user);
      return res.status(statusAPI.CREATED.code).json(user);
    } catch (error) {
      throw error;
    }
  }

  // LOGIN

  async login(req, res) {
    try {
      const { email, password } = req.body;

      let errors = {};
      if (!email) errors.email = "Email is required";
      if (!password) errors.password = "Password is required";

      if (Object.keys(errors).length > 0) {
        return res
          .status(statusAPI.BAD_REQUEST.code)
          .send(`All input is required: ${JSON.stringify(errors)}`);
      } else {
        const user = await User.findOne({ email });

        if (user && (await bcryptjs.compare(password, user.password))) {
          // Create token
          const token = await generateToken(
            user._id.toString(),
            email,
            user.role
          );
          // user
          return res.status(200).setHeader("Authorization", token).json(user);
        }
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Logout

  async logout(req, res) {
    try {
      const token = req.headers["authorization"];

      await destroyToken(token);

      return res.status(204).send({ message: "Logout successfully" });
    } catch (error) {
      console.log(error);
    }
  }

  // GET AdminController

  async getAll(req, res) {
    try {
      const pageSize = parseInt(req.query.pageSize);
      const page = parseInt(req.query.page);
      const skip = (page - 1) * pageSize;
      User.countDocuments({}, async function (err, count) {
        if (err) {
          console.log(err);
        } else {
          const totalElements = count;
          const totalPages = Math.ceil(totalElements / pageSize);
          await User.find({}, { password: 0 })
            .skip(skip)
            .limit(pageSize)
            .then((data) => {
              const numberOfElements = data.length;
              res.status(201).json({
                data,
                totalElements,
                totalPages,
                numberOfElements,
                pageAble: { page, pageSize },
              });
            })
            .catch((err) => {
              return res.status(500).json("Error server");
            });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // Find One User
  async findOne(req, res) {
    try {
      const id = req.params.id;

      const user = await User.findById(id, { password: 0, otp_code: 0 }).exec();

      return res.status(200).json(user);
    } catch (error) {
      throw error;
    }
  }

  // UpdateUser
  async updateUser(req, res) {
    try {
      const id = req.params.id;
      const user = await User.findByIdAndUpdate(id, req.body, { new: true });
      return res.json(user);
    } catch (error) {
      throw error;
    }
  }

  // Delete one
  async deleteOne(req, res) {
    try {
      const id = req.params.id;
      await User.findByIdAndDelete(id, { new: true });
      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new AdminController();
