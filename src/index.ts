import Fastify from "fastify";
import auth from "./plugin/auth.js";
import { prisma } from "../prisma/prisma.js";
import bcrypt from "bcrypt";

const app = Fastify();
const port = 3000;

app.register(auth);

app.post("/register", async (request, reply) => {
  const { email, password } = request.body as any;

  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (isUserExist) {
    return reply.status(400).send({ message: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashPassword },
  });
  return user;
});

app.post("/login", async (request, reply) => {
  const { email, password } = request.body as any;

  if (!email || !password) {
    return reply.status(400).send({
      message: "Please enter a valid email and password",
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const token = app.jwt.sign({ id: user.id, email: user.email });

      return {
        message: "Login successful",
        token,
      };
    }
  }

  return reply.status(401).send({
    message: "Incorrect email or password",
  });
});

app.get(
  "/profile",
  {
    preHandler: [
      async (request, reply) => await app.authenticate(request, reply),
    ],
  },
  async (request, reply) => {
    return {
      message: "Protected profile",
      user: request.user,
    };
  },
);

app.listen({ port: port }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${port}`);
});
