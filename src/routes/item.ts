import { diContainer } from "@fastify/awilix";
import { FastifyInstance } from "fastify";
import {
  itemIdParamSchema,
  itemPayloadSchema,
  itemChangeAmountSchema,
} from "@schemas/item.js";
import { ItemPayload } from "@models/item.js";
import { ItemController } from "@controllers/item.js";
import { authenticateToken } from "@hooks/authenticateToken.js";

export interface ItemRoutes {
  initRoutes(app: FastifyInstance): void;
}

export class DefaultItemRoutes implements ItemRoutes {
  private readonly controller: ItemController;

  constructor() {
    this.controller = diContainer.resolve("itemController");
  }

  initRoutes(app: FastifyInstance) {
    // Fetches all available items
    app.get(
      "/api/items",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (_, reply) => {
        this.controller.getAllItems(reply);
      }
    );

    // Fetches one item by a given id after validating the query parameter
    app.get<{ Params: { id: string } }>(
      "/api/items/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: itemIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.getOneItem(request, reply);
      }
    );

    // Inserts an item after validating the request body
    app.post<{ Body: ItemPayload }>(
      "/api/items",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          body: itemPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.insertItem(request, reply);
      }
    );

    // Updates an existing item after validating the query parameter and request body
    app.put<{ Params: { id: string }; Body: ItemPayload }>(
      "/api/items/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: itemIdParamSchema,
          body: itemPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.updateItem(request, reply);
      }
    );

    // Deletes an existing item after validating the query parameter
    app.delete<{ Params: { id: string } }>(
      "/api/items/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: itemIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.deleteItem(request, reply);
      }
    );

    // Adjusts an existing item amount after validating the query parameter and request body
    app.patch<{ Params: { id: string }; Body: { amount: number } }>(
      "/api/items/:id",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: itemIdParamSchema,
          body: itemChangeAmountSchema,
        },
      },
      (request, reply) => {
        this.controller.changeItemAmount(request, reply);
      }
    );
  }
}
