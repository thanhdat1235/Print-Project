class PostController {
  post(req, res) {
    res.json("Hello World");
  }
}

module.exports = new PostController();
