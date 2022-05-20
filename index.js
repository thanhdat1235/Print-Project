const http = require("http");
const app = require("./app");
const route = require("./routes");
const server = http.createServer(app);

const { API_PORT } = process.env;
const port = API_PORT || process.env.PORT;
route(app);

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
