import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { User } from "../database/schemas/user.schema";
import { CreateUserRegDto } from "./dto/CreateUserRegDto";
import { CreateUserLoginDto } from "./dto/CreateUserLoginDto";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, HttpException } from "@nestjs/common";
import { CreateGoogleAuthDto } from "./dto/CreateGoogleAuthDto";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe("validateUser", () => {
    let mockUser: User;

    beforeEach(() => {
      mockUser = {
        _id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password",
      } as unknown as User;
    });

    it("should return user object if email and password are correct", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      // @ts-expect-error tests case
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const result = await authService.validateUser(
        mockUser.email,
        mockUser.password
      );

      expect(result).toEqual({ ...mockUser, password: undefined });
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "password");
    });

    it("should return null if user not found", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.validateUser(
        mockUser.email,
        mockUser.password
      );

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it("should return null if password is incorrect", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      // @ts-expect-error tests case
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const result = await authService.validateUser(
        mockUser.email,
        mockUser.password
      );

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password
      );
    });
  });

  describe("login", () => {
    let mockUser: User;
    let mockCreateUserLoginDto: CreateUserLoginDto;

    beforeEach(() => {
      mockUser = {
        _id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password",
      } as unknown as User;

      mockCreateUserLoginDto = {
        email: "johndoe@example.com",
        password: "password",
      };
    });

    it("should return user object and access token if email and password are correct", async () => {
      authService.validateUser = jest.fn().mockResolvedValue({...mockUser, password: undefined});
      jwtService.signAsync = jest.fn().mockResolvedValue("token");

      const result = await authService.login(mockCreateUserLoginDto);

      expect(result).toEqual({
        user: { ...mockUser,  password: undefined },
        access_token: "token",
      });
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockCreateUserLoginDto.email,
        mockCreateUserLoginDto.password
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it("should throw BadRequestException if email or password is incorrect", async () => {
      authService.validateUser = jest.fn().mockResolvedValue(null);

      await expect(authService.login(mockCreateUserLoginDto)).rejects.toThrow(
        BadRequestException
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockCreateUserLoginDto.email,
        mockCreateUserLoginDto.password
      );
    });
  });

  describe("register", () => {
    let mockUser: User;
    let mockCreateUserRegDto: CreateUserRegDto;

    beforeEach(() => {
      mockUser = {
        _id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password",
      } as unknown as User;

      mockCreateUserRegDto = {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password",
      };
    });

    it("should return user object and access token if email is unique and user successfully created", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(null);
      usersService.create = jest.fn().mockResolvedValue({...mockUser, password: undefined});
      jwtService.signAsync = jest.fn().mockResolvedValue("token");
      // @ts-expect-error tests case
      bcrypt.hash = jest.fn().mockResolvedValue("hashed_password");

      const result = await authService.register(mockCreateUserRegDto);

      expect(result).toEqual({
        user: { ...mockUser, password: undefined },
        access_token: "token",
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateUserRegDto.email
      );
      expect(usersService.create).toHaveBeenCalledWith({
        name: mockCreateUserRegDto.name,
        email: mockCreateUserRegDto.email,
        password: "hashed_password",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateUserRegDto.password,
        10
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it("should throw HttpException if email already exists", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.register(mockCreateUserRegDto)).rejects.toThrow(
        new HttpException(
          `Пользователь с почтой ${mockCreateUserRegDto.email} уже существует`,
          400
        )
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateUserRegDto.email
      );
    });
  });

  describe("googleAuth", () => {
    let mockUser: User;
    let mockCreateGoogleAuthDto: CreateGoogleAuthDto;

    beforeEach(() => {
      mockUser = {
        _id: "1",
        name: "John Doe",
        email: "johndoe@example.com",
      } as unknown as User;

      mockCreateGoogleAuthDto = {
        name: "John Doe",
        email: "johndoe@example.com",
        profileImage: "/path/to/image",
        withGoogle: true,
        emailVerified: true,
      };
    });

    it("should return user object and access token if email is unique and user successfully created", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(null);
      usersService.create = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue("token");

      const result = await authService.googleAuth(mockCreateGoogleAuthDto);

      expect(result).toEqual({
        user: mockUser,
        access_token: "token",
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateGoogleAuthDto.email
      );
      expect(usersService.create).toHaveBeenCalledWith(mockCreateGoogleAuthDto);
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it("should return user object and access token if user with email already exists", async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue("token");

      const result = await authService.googleAuth(mockCreateGoogleAuthDto);

      expect(result).toEqual({
        user: mockUser,
        access_token: "token",
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        mockCreateGoogleAuthDto.email
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
    });
  });
});
