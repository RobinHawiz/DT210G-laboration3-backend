// Load environment variables
import "./src/config/env.js";
import bcrypt from "bcrypt";

import DatabaseConstructor, { Database } from "better-sqlite3";

let db: Database | undefined;

try {
  // Connect to db
  const dbPath = process.env.DATABASE_INSTALL_PATH;
  if (!dbPath) {
    throw new Error("Failed to create db: Missing DATABASE in .env");
  }
  db = new DatabaseConstructor(dbPath);

  // Create table item
  db.exec("drop table if exists item;");

  db.exec(`CREATE TABLE item(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT NOT NULL,
        amount INTEGER NOT NULL
        );`);

  db.exec(
    `insert into item (name, description, price, image_url, amount) values ('Drake', 'En förödande varelse!', '14.90', 'No url', '100')`
  );

  // Create table user
  db.exec("drop table if exists user;");

  db.exec(`CREATE TABLE user(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL
        );`);

  let username = "mmbullar";
  let passwordHash = await bcrypt.hash("jagharbakatbullar", 10);

  db.prepare(
    `insert into user (username, password_hash)
              values(@username, @passwordHash)`
  ).run({ username, passwordHash });

  console.log("DB initialized at:", dbPath);
} catch (e) {
  console.error("---ERROR---");
  console.error(e instanceof Error ? e.message : e);
} finally {
  if (db) db.close();
}
