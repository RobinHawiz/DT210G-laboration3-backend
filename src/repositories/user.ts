import { diContainer } from "@fastify/awilix";
import { Database } from "better-sqlite3";
import { UserEntity, UserPayload } from "@models/user.js";

export interface UserRepository {
  // Interface for verifying an admin users login credentials. Returns one user.
  findByUsername(username: string): UserEntity;
  // Returns all users
  findAllUsers(): Array<UserEntity>;
  // Returns one user
  findOneUser(id: string): UserEntity;
  // Inserts an user and returns the id
  insertUser(payload: UserPayload): number | bigint;
  // Updates an existing user and returns affected rows
  updateUser(id: string, payload: UserPayload): number;
  // Deletes an user and returns affected rows
  deleteUser(id: string): number;
}

export class SQLiteUserRepository implements UserRepository {
  private readonly db: Database;

  constructor() {
    this.db = diContainer.resolve("db");
  }

  findByUsername(username: string) {
    try {
      return this.db
        .prepare(
          `select username, password_hash as passwordHash from user where username = @username`
        )
        .get({ username }) as UserEntity;
    } catch (error) {
      console.error("Database user lookup error:", error);
      throw error;
    }
  }

  findAllUsers() {
    return this.db
      .prepare(
        `select username, password_hash
           from user
          order by id ASC`
      )
      .all() as Array<UserEntity>;
  }

  findOneUser(id: string) {
    return this.db
      .prepare(
        `select username, password_hash
           from user
          where id = @id`
      )
      .get({ id }) as UserEntity;
  }

  insertUser(payload: UserPayload) {
    return this.db
      .prepare(
        `insert into user (username, password_hash)
              values(@username, @password)`
      )
      .run(payload).lastInsertRowid;
  }

  updateUser(id: string, payload: UserPayload) {
    return this.db
      .prepare(
        `update user
           set username = @username,
               password_hash = @password
         where id = @id`
      )
      .run({ id, ...payload }).changes;
  }

  deleteUser(id: string): number {
    return this.db.prepare(`delete from user where id = @id`).run({ id })
      .changes;
  }
}
