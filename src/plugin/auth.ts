import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function authPlugin(fastify, opts) {
  await fastify.register(jwt, {
    secret: "your-super-secret-key-change-this",
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply
        .status(401)
        .send({ message: "Unauthorized: Invalid or missing token" });
    }
  });
});
