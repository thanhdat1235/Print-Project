const User = require("../../model/user");
const bcryptjs = require("bcryptjs");
const statusAPI = require("../../utils/statusAPI");
const { sendEmail } = require("../../utils/sendMail");

const {
  redisClient,
  generateToken,
  destroyToken,
} = require("../../middleware/jwt");
const { deleteMany } = require("../../model/user");

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

      const otp_code = randomFixedInteger(6);

      const encryptedPassword = await bcryptjs.hash(password, 10);
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        created_at: new Date(),
        gender,
        address,
        otp_code: otp_code,
        role: "User",
      });
      if (!user) {
        return res
          .status(statusAPI.BAD_REQUEST.code)
          .send({ message: "Create account failed" });
      }
      const subject = "Mã xác thực OTP";
      const htmlContent = `<p>Ma OTP cua ban la: ${otp_code}</p>`;
      const resSendEmail = await sendEmail(email, subject, htmlContent);
      if (!resSendEmail)
        return res.status(500).send({ message: "Send OTP failed" });
      return res
        .status(statusAPI.CREATED.code)
        .send({ message: "OTP sended to your email account" });
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
      console.log(id);
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

  // Verify OTP
  async verify(req, res) {
    const email = req.params.email;
    const { otp_code } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User with email does not already exists" });
    if (otp_code !== user.otp_code) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    return res.status(200).send({ message: "Verify OTP successfully" });
  }

  // Forgotpassword

  async forgotpassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(statusAPI.BAD_REQUEST.code)
        .send({ message: "User with email does not already exists" });

    const otp_code = randomFixedInteger(6);

    const updateUser = await User.findOneAndUpdate(
      { email },
      { otp_code: otp_code },
      { upsert: true }
    );
    console.log(otp_code);
    if (!updateUser) {
      return res.status(404).send({ message: "Update OTP failed" });
    }

    const subject = "Mã xác thực OTP";
    const htmlContent = `<p>Ma OTP cua ban la: ${otp_code}</p>`;
    const resSendEmail = await sendEmail(email, subject, htmlContent);

    if (!resSendEmail)
      return res.status(500).send({ message: "Send OTP failed" });

    return res
      .status(200)
      .send({ message: "OTP sended to your email account" });
  }

  // ResetPassword
  async resetPassword(req, res) {
    const email = req.params.email;
    const { password } = req.body;
    const user = await User.findOne({ email });
    const encryptedPassword = await bcryptjs.hash(password, 10);
    let errors = {};
    if (!email) {
      errors.email = "Email is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: JSON.stringify(errors) });
    }

    if (!user) {
      res.status(400).send({ message: "User not found!" });
    }

    try {
      await User.findOneAndUpdate({ email }, { password: encryptedPassword });
      res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
      res.status(400).send({ message: "Error when update password!" });
      console.log(error);
    }
  }
  // Delete many
  async deleteMany(req, res) {
    const ids = req.body.id;
    console.log(ids);
    const query = { _id: { $in: ids } };
    try {
      await User.deleteMany(query);
      res.status(statusAPI.OK.code).send({ message: "Thanh cong" });
    } catch (error) {
      console.log(error);
    }
  }
  // Search
  async search(req, res) {
    const payload = req.body.payload.trim().replace(/[^a-zA-Z0-9 \s\s+]/g, " ");
    const search = await User.find({
      $or: [
        { first_name: { $regex: `${payload}`, $options: "i" } },
        { last_name: { $regex: `${payload}`, $options: "i" } },
        { address: { $regex: `${payload}`, $options: "i" } },
        { email: { $regex: `${payload}`, $options: "i" } },
      ],
    });
    if (payload) {
      res.status(200).json({ payload: search });
    } else {
      const result = await User.find({}, { password: 0 });
      res.status(200).json({ payload: result });
    }
  }
}

module.exports = new AdminController();
