import "@config/env.js"; // Load environment variables
import { diContainer } from "@fastify/awilix"; // DI
import * as awilix from "awilix"; // DI
import Fastify from "fastify";
import cors from "@fastify/cors";
import connectToSQLiteDb from "@config/db.js";
import { DefaultItemRoutes } from "@routes/item.js";
import { DefaultItemController } from "@controllers/item.js";
import { DefaultItemService } from "@services/item.js";
import { SQLiteItemRepository } from "@repositories/item.js";

// Bootstraps Fastify, registers DI, mounts routes.
export default async function build() {
  // Instantiate and configure the framework
  const app = Fastify({
    logger: true,
  });

  // Configure CORS origin
  app.register(cors, {
    origin: process.env.CORS_ORIGINS ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    exposedHeaders: ["Location"],
  });

  // DI setup
  diContainer.register({
    db: awilix
      .asFunction(connectToSQLiteDb)
      .singleton()
      .disposer((db) => db.close()),
    itemController: awilix.asClass(DefaultItemController).singleton(),
    itemService: awilix.asClass(DefaultItemService).singleton(),
    itemRepo: awilix.asClass(SQLiteItemRepository).singleton(),
  });

  // Mount routes
  const routes = new DefaultItemRoutes();
  routes.initRoutes(app);

  return app;
}
