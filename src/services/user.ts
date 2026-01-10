import { diContainer } from "@fastify/awilix";
import { UserEntity, UserPayload } from "@models/user.js";
import { DomainError } from "@errors/domainError.js";
import { UserRepository } from "@repositories/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserService {
  /**
   * Attempts to authenticate an admin user.
   *
   * @returns JWT string on successful login.
   * @throws DomainError on failure.
   */
  loginUser(payload: UserPayload): Promise<string>;
  // Returns all users
  getAllUsers(): Array<UserEntity>;
  // Returns one user or throws DomainError("User not found")
  getOneUser(id: string): UserEntity;
  // Inserts and returns a new id
  insertUser(userPayload: UserPayload): Promise<number | bigint>;
  // Updates if exists. Otherwise throws DomainError("User not found")
  updateUser(id: string, payload: UserPayload): void;
  // Deletes if exists. Otherwise throws DomainError("User not found")
  deleteUser(id: string): void;
}

export class DefaultUserService implements UserService {
  private readonly repo: UserRepository;

  constructor() {
    this.repo = diContainer.resolve("userRepo");
  }

  async loginUser(payload: UserPayload) {
    const user = this.repo.findByUsername(payload.username);
    if (!user) {
      throw new DomainError(`Username or password is incorrect`);
    }
    const passwordMatch = await bcrypt.compare(
      payload.password,
      user.passwordHash
    );
    console.log();
    console.log(passwordMatch);
    console.log();
    if (!passwordMatch) {
      throw new DomainError(`Username or password is incorrect`);
    }
    // Create JWT
    const token: string = jwt.sign({}, process.env.JWT_SECRET_KEY as string, {
      expiresIn: "1h",
    });
    return token;
  }

  getAllUsers() {
    return this.repo.findAllUsers();
  }

  getOneUser(id: string) {
    const user = this.repo.findOneUser(id);
    if (!user) {
      throw new DomainError(`User not found`);
    }
    return user;
  }

  async insertUser(payload: UserPayload) {
    const user = this.repo.findByUsername(payload.username);
    if (!!user) {
      throw new DomainError(`User already exists`);
    }
    // Hash password
    payload.password = await bcrypt.hash(payload.password, 10);
    return this.repo.insertUser(payload);
  }

  async updateUser(id: string, payload: UserPayload) {
    // Hash password
    payload.password = await bcrypt.hash(payload.password, 10);
    const changes = this.repo.updateUser(id, payload);
    if (changes === 0) {
      throw new DomainError(`User not found`);
    }
  }

  deleteUser(id: string) {
    const changes = this.repo.deleteUser(id);
    if (changes === 0) {
      throw new DomainError(`User not found`);
    }
  }
}
