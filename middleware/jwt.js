const redis = require("redis");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");
const config = process.env;

async function createRedisClient() {
  const client = redis.createClient();
  client.on("connect", (err) => {
    console.log("Client connected to Redis...");
  });
  client.on("ready", (err) => {
    console.log("Redis ready to use");
  });
  client.on("error", (err) => {
    console.error("Redis Client", err);
  });
  client.on("end", () => {
    console.log("Redis disconnected successfully");
  });
  await client.connect();
  return client;
}

const generateToken = async (id, email, role) => {
  const redisClient = await createRedisClient();
  const token = jwt.sign({ user_id: id, email, role }, config.TOKEN_KEY, {
    expiresIn: "60s",
  });

  const check = await redisClient.exists(token);
  if (check === 1) throw new Error("Token already exist in cache");
  await redisClient.SET(token, "valid", {
    EX: 60 * 30,
  });

  return token;
};

const generateRefreshToken = (id, email, role) => {
  const refresh_token = jwt.sign(
    { user_id: id, email, role },
    config.TOKEN_KEY,
    {
      expiresIn: "7d",
    }
  );
  return refresh_token;
};

const destroyToken = async (token) => {
  const redisClient = await createRedisClient();
  const check = await redisClient.exists(token);
  if (check !== 1) {
    console.info("Token is expire in cache");
    return;
  }
  await redisClient.DEL(token);
  console.info("Logout successfully");
  return;
};

const verifyToken = async (token) => {
  const redisClient = await createRedisClient();

  const check = await redisClient.exists(token);
  if (check !== 1) {
    throw Error("Token is expire in cache");
  }

  return jwt.verify(token, config.TOKEN_KEY);
};

module.exports = {
  generateToken,
  destroyToken,
  verifyToken,
  generateRefreshToken,
};
