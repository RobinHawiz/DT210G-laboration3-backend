import { diContainer } from "@fastify/awilix";
import { FastifyReply, FastifyRequest } from "fastify";
import { ItemPayload } from "@models/item.js";
import { DomainError } from "@errors/domainError.js";
import { ItemService } from "@services/item.js";

export interface ItemController {
  /** GET /api/items → 200 */
  getAllItems(reply: FastifyReply): void;
  /** GET /api/items/:id → 200, 400 bad request, 500 internal server error */
  getOneItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): void;
  /** POST /api/items → 201, 400 bad request, 500 internal server error */
  insertItem(
    request: FastifyRequest<{ Body: ItemPayload }>,
    reply: FastifyReply
  ): void;
  /** PUT /api/items/:id → 204, 400 bad request, 500 internal server error */
  updateItem(
    request: FastifyRequest<{ Params: { id: string }; Body: ItemPayload }>,
    reply: FastifyReply
  ): void;
  /** DELETE /api/items/:id → 204, 400 bad request, 500 internal server error */
  deleteItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): void;
  /** PATCH /api/items/:id → 204, 400 bad request, 500 internal server error */
  changeItemAmount(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { amount: number };
    }>,
    reply: FastifyReply
  ): void;
}

export class DefaultItemController implements ItemController {
  private readonly service: ItemService;

  constructor() {
    this.service = diContainer.resolve("itemService");
  }

  getAllItems(reply: FastifyReply) {
    try {
      const items = this.service.getAllItems();
      reply.send(items);
    } catch (err) {
      console.error("Error retrieving item data:", err);
      reply.code(500).send({ ok: false });
    }
  }

  getOneItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const item = this.service.getOneItem(id);
      reply.code(200).send(item);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving item data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving item data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  insertItem(
    request: FastifyRequest<{ Body: ItemPayload }>,
    reply: FastifyReply
  ) {
    try {
      const id = this.service.insertItem(request.body);
      reply.code(201).header("Location", `/api/items/${id}`).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error inserting item data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error inserting item data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  updateItem(
    request: FastifyRequest<{ Params: { id: string }; Body: ItemPayload }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const payload = request.body;
      this.service.updateItem(id, payload);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error updating item data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error updating item data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  deleteItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      this.service.deleteItem(id);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error deleting item data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error deleting item data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  changeItemAmount(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { amount: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { amount } = request.body;
      this.service.changeItemAmount(id, amount);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error changing item amount:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error changing item amount:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }
}
