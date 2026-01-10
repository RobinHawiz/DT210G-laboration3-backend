import { diContainer } from "@fastify/awilix";
import { ItemEntity, ItemPayload } from "@models/item.js";
import { DomainError } from "@errors/domainError.js";
import { ItemRepository } from "@repositories/item.js";

export interface ItemService {
  // Returns all items
  getAllItems(): Array<ItemEntity>;
  // Returns one item or throws DomainError("Item not found")
  getOneItem(id: string): ItemEntity;
  // Inserts and returns a new id
  insertItem(itemPayload: ItemPayload): number | bigint;
  // Updates if exists. Otherwise throws DomainError("Item not found")
  updateItem(id: string, payload: ItemPayload): void;
  // Deletes if exists. Otherwise throws DomainError("Item not found")
  deleteItem(id: string): void;
  // Adjusts amount. Otherwise throws DomainError on not found or invalid amount
  changeItemAmount(id: string, amount: number): void;
}

export class DefaultItemService implements ItemService {
  private readonly repo: ItemRepository;

  constructor() {
    this.repo = diContainer.resolve("itemRepo");
  }

  getAllItems() {
    return this.repo.findAllItems();
  }

  getOneItem(id: string) {
    const item = this.repo.findOneItem(id);
    if (!item) {
      throw new DomainError(`Item not found`);
    }
    return item;
  }

  insertItem(payload: ItemPayload) {
    return this.repo.insertItem(payload);
  }

  updateItem(id: string, payload: ItemPayload) {
    const changes = this.repo.updateItem(id, payload);
    if (changes === 0) {
      throw new DomainError(`Item not found`);
    }
  }

  deleteItem(id: string) {
    const changes = this.repo.deleteItem(id);
    if (changes === 0) {
      throw new DomainError(`Item not found`);
    }
  }

  changeItemAmount(id: string, amount: number) {
    const item = this.repo.findOneItem(id);
    if (!item) {
      throw new DomainError(`Item not found`);
    }
    if (item.amount + amount < 0) {
      throw new DomainError(
        `Insufficient stock amount. Current: ${item.amount}, requested: ${amount}`
      );
    }
    this.repo.changeItemAmount(id, amount);
  }
}
