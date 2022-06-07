const Post = require("../../model/post");
const statusAPI = require("../../utils/statusAPI");

class PostController {
  async createPost(req, res) {
    const { category, title, ckeditor } = req.body;
    console.log(req.body);
    try {
      const post = await Post.create({
        category,
        title,
        created_at: new Date(),
        ckeditor,
      });
      if (!post) {
        res.status(statusAPI.BAD_REQUEST.code).send({
          message: "Create failed",
        });
      }
      res.status(statusAPI.CREATED.code).json(post);
    } catch (error) {
      console.log(error);
    }
  }

  async getAll(req, res) {
    try {
      const pageSize = parseInt(req.query.pageSize);
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
      const ids = req.body;
      console.log(ids);
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
}

module.exports = new PostController();
