import { JSONSchemaType } from "ajv";
import { UserPayload } from "@models/user.js";

/**
 * Params validation schema for routes with `:id`.
 *
 * - `id`: positive number
 * - Path params are strings but Ajv by default coerces to number,
 * so handlers can safely use `id: number`.
 *
 */
export const userIdParamSchema: JSONSchemaType<{ id: number }> = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
  },
  required: ["id"],
};

/**
 * Validation schema for user payload (create/update)
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `username`: non-empty string, max 50 characters
 * - `password`: non-empty string, max 100 characters
 */
export const userPayloadSchema: JSONSchemaType<UserPayload> = {
  type: "object",
  properties: {
    username: { type: "string", maxLength: 50, minLength: 1 },
    password: { type: "string", maxLength: 100, minLength: 1 },
  },
  required: ["username", "password"],
  additionalProperties: false,
};
