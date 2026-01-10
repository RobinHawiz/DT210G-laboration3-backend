import "@config/env.js"; // Load environment variables
import { diContainer } from "@fastify/awilix"; // DI
import * as awilix from "awilix"; // DI
import Fastify from "fastify";
import cors from "@fastify/cors";
import connectToSQLiteDb from "@config/db.js";
import { DefaultItemRoutes, DefaultUserRoutes } from "@routes/index.js";
import {
  DefaultItemController,
  DefaultUserController,
} from "@controllers/index.js";
import { DefaultItemService, DefaultUserService } from "@services/index.js";
import {
  SQLiteItemRepository,
  SQLiteUserRepository,
} from "@repositories/index.js";

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
    userController: awilix.asClass(DefaultUserController).singleton(),
    userService: awilix.asClass(DefaultUserService).singleton(),
    userRepo: awilix.asClass(SQLiteUserRepository).singleton(),
  });

  // Mount routes
  const itemRoutes = new DefaultItemRoutes();
  const userRoutes = new DefaultUserRoutes();

  itemRoutes.initRoutes(app);
  userRoutes.initRoutes(app);

  return app;
}
