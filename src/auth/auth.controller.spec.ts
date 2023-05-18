import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "../database/schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { getModelToken } from "@nestjs/mongoose";
import * as request from "supertest";

describe("AuthController", () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        UsersService,
        {
          provide: getModelToken("User"),
          useFactory: () => ({}),
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe("POST /auth/login", () => {
    it("should return a token when passed valid credentials", async () => {
      const credentials = { username: "johndoe", password: "password" };
      const token = "my.jwt.token";
      const user = {
        username: "johndoe",
        password: "password",
      } as unknown as User;

      jest
        .spyOn(authService, "login")
        .mockImplementation(() =>
          Promise.resolve({ access_token: token, user })
        );

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBe(token);
      expect(response.body.user).toStrictEqual(user);
    });
  });

  describe("POST /auth/register", () => {
    it("should create a new user when passed valid credentials", async () => {
      const credentials = {
        username: "johndoe",
        password: "password",
        email: "johndoe@email.com",
      } as unknown as User;
      const token = "my.jwt.token";

      jest
        .spyOn(authService, "register")
        .mockImplementation(() =>
          Promise.resolve({ access_token: token, user: credentials })
        );

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(credentials);

      expect(response.status).toBe(201);
      expect(response.body.access_token).toBe(token);
    });
  });
});
