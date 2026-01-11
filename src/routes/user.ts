import { diContainer } from "@fastify/awilix";
import { FastifyInstance } from "fastify";
import { userIdParamSchema, userPayloadSchema } from "@schemas/user.js";
import { UserPayload } from "@models/user.js";
import { UserController } from "@controllers/user.js";
import { authenticateToken } from "@hooks/authenticateToken.js";

export interface UserRoutes {
  initRoutes(app: FastifyInstance): void;
}

export class DefaultUserRoutes implements UserRoutes {
  private readonly controller: UserController;

  constructor() {
    this.controller = diContainer.resolve("userController");
  }

  initRoutes(app: FastifyInstance) {
    // Authenticates a user and returns a JWT if successful
    app.post<{ Body: UserPayload }>(
      "/api/users/login",
      {
        schema: {
          body: userPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.loginUser(request, reply);
      }
    );

    // Validates the JWT
    app.get(
      "/api/auth",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (_, reply) => {
        reply.code(200).send();
      }
    );

    // Fetches all available users
    app.get(
      "/api/users",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (_, reply) => {
        this.controller.getAllUsers(reply);
      }
    );

    // Fetches one user by a given id after validating the query parameter
    app.get<{ Params: { id: string } }>(
      "/api/users/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: userIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.getOneUser(request, reply);
      }
    );

    // Inserts a user after validating the request body
    app.post<{ Body: UserPayload }>(
      "/api/users",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          body: userPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.insertUser(request, reply);
      }
    );

    // Updates an existing user after validating the query parameter and request body
    app.put<{ Params: { id: string }; Body: UserPayload }>(
      "/api/users/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: userIdParamSchema,
          body: userPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.updateUser(request, reply);
      }
    );

    // Deletes an existing user after validating the query parameter
    app.delete<{ Params: { id: string } }>(
      "/api/users/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: userIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.deleteUser(request, reply);
      }
    );
  }
}
