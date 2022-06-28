const Post = require("../../model/post");
const SubscribeNewPost = require("../../model/subcribenewpost");
const statusAPI = require("../../utils/statusAPI");
const decodedBase64 = require("../../utils/write");
const { sendEmail } = require("../../utils/sendMail");

class PostController {
  async createPost(req, res) {
    const { category, title, description, linkPost } = req.body;
    if (!category || !title || !description) {
      return res.status(400).send("All input is required");
    }
    const filename = title.trim().replace(/\s/g, "");
    const encoded = decodedBase64(req.body.ckeditor, `${filename}.png`);
    const ckeditor = encoded.linkImage;
    const urlImage = encoded.link;
    try {
      const post = await Post.create({
        category,

        title,
        created_at: new Date(),
        ckeditor,
        urlImage,
        description,
      });
      if (!post) {
        return res
          .status(statusAPI.BAD_REQUEST.code)
          .send({ message: "Create post failed" });
      }
      const allCustomers = SubscribeNewPost.find();
      if (!allCustomers) {
        return res.status(404).send({ message: "Bad request" });
      }
      const htmlContent = `Day la bai viet moi nhat cua AddyPrin. Hay truy cap vao ${linkPost}${post._id.toString()} de xem chi tiet</p>`;
      res.status(statusAPI.CREATED.code).send({ linkImage: encoded });
      Promise.all([allCustomers]).then((customers) => {
        if (customers.length > 0) {
          customers[0].forEach(async (customer) => {
            try {
              const email = customer.email;
              await sendEmail(email, subject, htmlContent);
              console.log("Thanh cong");
            } catch (error) {
              console.log(error);
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAll(req, res) {
    try {
      const pageSize = parseInt(req.query.pageSize || 6);
      const page = parseInt(req.query.page);
      const skip = (page - 1) * pageSize;
      Post.countDocuments({}, async function (err, count) {
        if (err) {
          console.log(err);
        } else {
          const totalElements = count;
          const totalPages = Math.ceil(totalElements / pageSize);
          await Post.find()
            .skip(skip)
            .limit(pageSize)
            .then((data) => {
              const numberOfElements = data.length;
              res.status(statusAPI.ACCEPTED.code).json({
                data,
                totalElements,
                totalPages,
                numberOfElements,
                pageAble: { page, pageSize },
              });
            })
            .catch((err) => {
              return res
                .status(statusAPI.UNAUTHORIZED.code)
                .send("Error server");
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updatePost(req, res) {
    const id = req.params.id;
    const { category, title, description } = req.body;
    if (!category || !title || !description) {
      return res.status(400).send("All input is required");
    }
    try {
      const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(statusAPI.ACCEPTED.code).json(post);
    } catch (error) {
      console.log(error);
    }
  }

  async delete(req, res) {
    try {
      const ids = req.body.id;
      console.log(ids);
      await Post.deleteMany({ _id: { $in: ids } });
      return res
        .status(statusAPI.ACCEPTED.code)
        .send({ message: "Delete successfully!" });
    } catch (error) {
      console.log(error);
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      const post = await Post.findById(id).exec();
      return res.status(statusAPI.OK.code).json(post);
    } catch (error) {
      console.log(error);
    }
  }

  async search(req, res) {
    const payload = req.body.payload.replace(/[[`_|+\=?<>\{\}\[\]\\\/]/gi, "");
    console.log(payload);
    try {
      const search = await Post.find({
        $or: [
          { category: { $regex: `${payload}`, $options: "i" } },
          { title: { $regex: `${payload}`, $options: "i" } },
        ],
      });
      if (payload) {
        return res.status(200).json({ payload: search });
      } else {
        return res.status(200).json({ payload: search });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteOne(req, res) {
    try {
      const id = req.params.id;
      await Post.findByIdAndDelete(id, { new: true });
      return res.status(200).json({
        message: "Post deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async searchByCategory(req, res) {
    const category = req.params.category;
    try {
      const result = await Post.find({ category: category });
      return res.status(statusAPI.OK.code).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async newCustomer(req, res) {
    const email = req.body.email;
    const oldCustomer = await SubscribeNewPost.findOne({ email });
    if (oldCustomer) {
      return res.status(409).send({ messages: "Email already exists" });
    }
    if (!email) {
      return res
        .status(statusAPI.NOT_FOUND.code)
        .send(statusAPI.NOT_FOUND.message);
    }
    try {
      const Customer = await SubscribeNewPost.create({ email });
      return res.status(statusAPI.CREATED.code).json(Customer);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new PostController();
