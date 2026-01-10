import { JSONSchemaType } from "ajv";
import { ItemPayload } from "@models/item.js";

/**
 * Params validation schema for routes with `:id`.
 *
 * - `id`: positive number
 * - Path params are strings but Ajv by default coerces to number,
 * so handlers can safely use `id: number`.
 *
 */
export const itemIdParamSchema: JSONSchemaType<{ id: number }> = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
  },
  required: ["id"],
};

/**
 * Validation schema for item payload (create/update)
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `name`: non-empty string, max 100 characters
 * - `description`: non-empty string, max 200 characters
 * - `price`: positive number
 * - `imageUrl`: non-empty string, max 2000 characters
 * - `amount`: positive number
 */
export const itemPayloadSchema: JSONSchemaType<ItemPayload> = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 100, minLength: 1 },
    description: { type: "string", maxLength: 200, minLength: 1 },
    price: { type: "number", minimum: 0 },
    imageUrl: { type: "string", maxLength: 2000, minLength: 1 },
    amount: { type: "integer", minimum: 0 },
  },
  required: ["name", "description", "price", "imageUrl", "amount"],
  additionalProperties: false,
};

/**
 * Validation schema for changing stock amount.
 *
 * - `amount`: number
 */
export const itemChangeAmountSchema: JSONSchemaType<{ amount: number }> = {
  type: "object",
  properties: {
    amount: { type: "integer" },
  },
  required: ["amount"],
  additionalProperties: false,
};
