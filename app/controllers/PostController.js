const Post = require("../../model/post");
const statusAPI = require("../../utils/statusAPI");
const decodedBase64 = require("../../utils/write");

class PostController {
  async createPost(req, res) {
    const { category, title, description } = req.body;
    const encoded = decodedBase64(req.body.ckeditor, `${title}.png`);
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
        res
          .status(statusAPI.BAD_REQUEST.code)
          .send({ message: "Create post failed" });
      }
      res.status(statusAPI.CREATED.code).send({ linkImage: encoded });
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
      // console.log(ids);
      await Post.remove({ _id: { $in: ids } });
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
      const postUpdated = await Post.findById(id).exec();
      return res.status(statusAPI.OK.code).json(postUpdated);
    } catch (error) {
      console.log(error);
    }
  }

  async search(req, res) {
    const payload = req.body.payload.trim().replace(/[^a-zA-Z0-9 \s\s+]/g, " ");
    try {
      const search = await Post.find({
        $or: [
          { category: { $regex: `${payload}`, $options: "i" } },
          { title: { $regex: `${payload}`, $options: "i" } },
        ],
      });
      if (payload) {
        return res.status(200).json({ payload: search });
      }
    } catch (error) {
      console.log(error);
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
}

module.exports = new PostController();
