// Represents a single item entry stored in the database
export type ItemEntity = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  amount: number;
};

export type ItemPayload = Omit<ItemEntity, "id">;
