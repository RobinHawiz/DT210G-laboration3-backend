import { diContainer } from "@fastify/awilix";
import { FastifyReply, FastifyRequest } from "fastify";
import { UserPayload } from "@models/user.js";
import { DomainError } from "@errors/domainError.js";
import { UserService } from "@services/user.js";

export interface UserController {
  /** POST /api/users/login → 200, 400 bad request, 500 internal server error */
  loginUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply
  ): void;
  /** GET /api/users → 200 */
  getAllUsers(reply: FastifyReply): void;
  /** GET /api/users/:id → 200, 400 bad request, 500 internal server error */
  getOneUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): void;
  /** POST /api/users → 201, 400 bad request, 500 internal server error */
  insertUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply
  ): void;
  /** PUT /api/users/:id → 204, 400 bad request, 500 internal server error */
  updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UserPayload }>,
    reply: FastifyReply
  ): void;
  /** DELETE /api/users/:id → 204, 400 bad request, 500 internal server error */
  deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): void;
}

export class DefaultUserController implements UserController {
  private readonly service: UserService;

  constructor() {
    this.service = diContainer.resolve("userService");
  }

  async loginUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply
  ) {
    try {
      const token = await this.service.loginUser(request.body);
      reply.code(200).send(token);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error authenticating admin user:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error authenticating admin user:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  getAllUsers(reply: FastifyReply) {
    try {
      const users = this.service.getAllUsers();
      reply.send(users);
    } catch (err) {
      console.error("Error retrieving user data:", err);
      reply.code(500).send({ ok: false });
    }
  }

  getOneUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const user = this.service.getOneUser(id);
      reply.code(200).send(user);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  async insertUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply
  ) {
    try {
      const id = await this.service.insertUser(request.body);
      reply.code(201).header("Location", `/api/users/${id}`).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error inserting user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error inserting user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UserPayload }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const payload = request.body;
      this.service.updateUser(id, payload);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error updating user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error updating user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      this.service.deleteUser(id);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error deleting user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error deleting user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }
}
