// Represents a single user entry stored in the database
export type UserEntity = {
  id: number;
  username: string;
  passwordHash: string;
};

export type UserPayload = Omit<UserEntity, "id" | "passwordHash"> & {
  password: string;
};
