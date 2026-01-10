import { diContainer } from "@fastify/awilix";
import { Database } from "better-sqlite3";
import { ItemEntity, ItemPayload } from "@models/item.js";

export interface ItemRepository {
  // Returns all items
  findAllItems(): Array<ItemEntity>;
  // Returns one item
  findOneItem(id: string): ItemEntity;
  // Inserts an item and returns the id
  insertItem(payload: ItemPayload): number | bigint;
  // Updates an existing item and returns affected rows
  updateItem(id: string, payload: ItemPayload): number;
  // Deletes an item and returns affected rows
  deleteItem(id: string): number;
  // Adjusts amount in stock by a certain amount
  changeItemAmount(id: string, amount: number): void;
}

export class SQLiteItemRepository implements ItemRepository {
  private readonly db: Database;

  constructor() {
    this.db = diContainer.resolve("db");
  }

  findAllItems() {
    return this.db
      .prepare(
        `select id, name, description, price, image_url as imageUrl, amount
           from item
          order by id ASC`
      )
      .all() as Array<ItemEntity>;
  }

  findOneItem(id: string) {
    return this.db
      .prepare(
        `select id, name, description, price, image_url as imageUrl, amount
           from item
          where id = @id`
      )
      .get({ id }) as ItemEntity;
  }

  insertItem(payload: ItemPayload) {
    return this.db
      .prepare(
        `insert into item (name, description, price, image_url, amount)
              values(@name, @description, @price, @imageUrl, @amount)`
      )
      .run(payload).lastInsertRowid;
  }

  updateItem(id: string, payload: ItemPayload) {
    return this.db
      .prepare(
        `update item
           set name = @name,
               description = @description,
               price = @price,
               image_url = @imageUrl,
               amount = @amount
         where id = @id`
      )
      .run({ id, ...payload }).changes;
  }

  deleteItem(id: string): number {
    return this.db.prepare(`delete from item where id = @id`).run({ id })
      .changes;
  }

  changeItemAmount(id: string, amount: number) {
    return this.db
      .prepare(
        `update item
            set amount = amount + @amount
          where id = @id`
      )
      .run({ id, amount });
  }
}
