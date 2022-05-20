const postRouter = require("./post.route");
const adminRouter = require("./admin.route");
function route(app) {
  app.use("/post", postRouter);
  app.use("/admin", adminRouter);
}

module.exports = route;
