const postRouter = require("./post.route");
const adminRouter = require("./admin.route");
const contactRouter = require("./contact.route");
function route(app) {
  app.use("/post", postRouter);
  app.use("/admin", adminRouter);
  app.use("/contact", contactRouter);
}

module.exports = route;
