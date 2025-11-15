import { AuthService } from "../services/AuthService";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { Usuario } from "../entities/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../lib/mailer";

// Mocks de dependencias externas
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomInt: jest.fn(() => 123456),
}));

jest.mock("../lib/mailer", () => ({
  sendVerificationEmail: jest.fn(),
}));

// Mock del repositorio
jest.mock("../repositories/UsuarioRepository");

describe("AuthService", () => {
  let service: AuthService;
  let repoMock: jest.Mocked<UsuarioRepository>;

  const mockUsuario: Usuario = {
      id: 1,
      nombre_usuario: "Usuario Prueba",
      contraseña: "123456_hasheado",
      rol: "Administrador",
      correo: "usuario@email.com",
      fecha_creacion: new Date(),
      identificador_unico: "ADMIN1",
      activo: true,
      codigo_login: "A1B2C3",
  };

  beforeEach(() => {
    service = new AuthService();
    repoMock = (UsuarioRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  test("solicitarLogin() lanza error si el usuario no existe", async () => {
    repoMock.findByCorreo.mockResolvedValue(null);

    await expect(
      service.solicitarLogin("usuario_no_existe@email.com", "654321")
    ).rejects.toThrow("Credenciales incorrectas.");
  });

  test("solicitarLogin() lanza error si la cuenta está desactivada", async () => {
    repoMock.findByCorreo.mockResolvedValue({ ...mockUsuario, activo: false });

    await expect(
      service.solicitarLogin("usuario_inactivo@email.com", "123456")
    ).rejects.toThrow("Cuenta desactivada.");
  });

  test("solicitarLogin() lanza error si la contraseña no coincide", async () => {
    repoMock.findByCorreo.mockResolvedValue(mockUsuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.solicitarLogin("usuario@email.com", "654321")
    ).rejects.toThrow("Credenciales incorrectas.");
  });

  test("solicitarLogin() genera código y envía correo", async () => {
    repoMock.findByCorreo.mockResolvedValue({ ...mockUsuario });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    repoMock.save.mockResolvedValue(mockUsuario);
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await service.solicitarLogin("usuario@email.com", "123456");

    expect(repoMock.findByCorreo).toHaveBeenCalledWith("usuario@email.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", mockUsuario.contraseña);

    expect(repoMock.save).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      mockUsuario.correo,
      "123456"
    );

    expect(result).toEqual({
      message: "Código enviado al correo.",
      correo: mockUsuario.correo,
    });
  });

  test("confirmarLogin() lanza error si JWT_SECRET no existe", async () => {
    delete process.env.JWT_SECRET;

    await expect(service.confirmarLogin("usuario@email.com", "A1B2C3"))
      .rejects.toThrow(
        "Error de configuración: JWT_SECRET no está definido en variables de entorno"
      );
  });

  test("confirmarLogin() lanza error si el usuario no existe", async () => {
    process.env.JWT_SECRET = "TEST_SECRET";

    repoMock.findByCorreo.mockResolvedValue(null);

    await expect(
      service.confirmarLogin("usuario@email.com", "A1B2C3")
    ).rejects.toThrow("Usuario no encontrado.");
  });

  test("confirmarLogin() lanza error si no hay código pendiente", async () => {
    process.env.JWT_SECRET = "TEST_SECRET";

    repoMock.findByCorreo.mockResolvedValue({ ...mockUsuario, codigo_login: undefined });

    await expect(
      service.confirmarLogin("usuario@email.com", "A1B2C3")
    ).rejects.toThrow("No hay un código de verificación pendiente.");
  });

  test("confirmarLogin() lanza error si el código es incorrecto", async () => {
    process.env.JWT_SECRET = "TEST_SECRET";

    repoMock.findByCorreo.mockResolvedValue({ ...mockUsuario, codigo_login: "987654" });

    await expect(
      service.confirmarLogin("usuario@email.com", "A1B2C3")
    ).rejects.toThrow("Código incorrecto.");
  });

  test("confirmarLogin() retorna token y usuario si todo es correcto", async () => {
    process.env.JWT_SECRET = "TEST_SECRET";

    repoMock.findByCorreo.mockResolvedValue({ ...mockUsuario, codigo_login: "A1B2C3" });
    repoMock.save.mockResolvedValue(mockUsuario);

    (jwt.sign as jest.Mock).mockReturnValue("FAKE_JWT_TOKEN");

    const result = await service.confirmarLogin("usuario@email.com", "A1B2C3");

    expect(repoMock.findByCorreo).toHaveBeenCalledWith("usuario@email.com");
    expect(repoMock.save).toHaveBeenCalled();

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUsuario.id, rol: mockUsuario.rol, correo: mockUsuario.correo },
      "TEST_SECRET",
      { expiresIn: "2h" }
    );

    expect(result).toEqual({
      message: "Login exitoso.",
      user: {
        id: mockUsuario.id,
        nombre_usuario: mockUsuario.nombre_usuario,
        correo: mockUsuario.correo,
        rol: mockUsuario.rol,
        identificador_unico: mockUsuario.identificador_unico,
      },
      token: "FAKE_JWT_TOKEN",
    });
  });
});
