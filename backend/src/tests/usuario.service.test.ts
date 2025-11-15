import { UsuarioService } from "../services/Usuario.service";
import { Usuario } from "../entities/Usuario";
import { UsuarioRepository } from "../repositories/Usuarios.repository";

// En esta linea simulamos el UUID
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

// Simulamos el repositorio
jest.mock("../repositories/Usuarios.repository");

describe("UsuarioService", () => {
  let service: UsuarioService;
  let repoMock: jest.Mocked<UsuarioRepository>;

  const mockUsuario: Usuario = {
    id: 1,
    nombre_usuario: "Usuario Prueba",
    contraseña: "123456",
    rol: "Administrador",
    correo: "usuario@email.com",
    fecha_creacion: new Date(),
    identificador_unico: "ADMIN1",
    activo: true,
    codigo_login: "A1B2C3",
  };

  beforeEach(() => {
    service = new UsuarioService();
    repoMock = (UsuarioRepository as jest.Mock).mock.instances[0];
    jest.clearAllMocks();
  });

  // CREATE
  test("createUsuario() debe crear un usuario", async () => {
    repoMock.create.mockResolvedValue(mockUsuario);

    const result = await service.createUsuario({
      nombre_usuario: "Usuario Prueba",
      contraseña: "123456",
      rol: "Administrador",
      correo: "usuario@email.com",
    });

    expect(result).toEqual(mockUsuario);
    expect(repoMock.create).toHaveBeenCalled();
  });

  // FIND ALL
  test("getAllUsuarios() debe obtener todos los usuarios", async () => {
    repoMock.findAll.mockResolvedValue([mockUsuario]);

    const result = await service.getAllUsuarios();

    expect(result).toEqual([mockUsuario]);
    expect(repoMock.findAll).toHaveBeenCalled();
  });

  // FIND BY ID
  test("getUsuarioById() debe devolver un usuario por ID", async () => {
    repoMock.findById.mockResolvedValue(mockUsuario);

    const result = await service.getUsuarioById(1);

    expect(result).toEqual(mockUsuario);
    expect(repoMock.findById).toHaveBeenCalledWith(1);
  });

  // UPDATE
  test("updateUsuario() debe actualizar un usuario existente", async () => {
    repoMock.update.mockResolvedValue(undefined);
    repoMock.findById.mockResolvedValue({
      ...mockUsuario,
      nombre_usuario: "Usuario actualizado",
    });

    const result = await service.updateUsuario(1, {
      nombre_usuario: "Usuario actualizado",
    });

    expect(repoMock.update).toHaveBeenCalledWith(1, {
      nombre_usuario: "Usuario actualizado",
    });
    expect(result?.nombre_usuario).toBe("Usuario actualizado");
  });

  // DELETE
  test("deleteUsuario() debe eliminar un usuario", async () => {
    repoMock.delete.mockResolvedValue(true);

    const result = await service.deleteUsuario(1);

    expect(result).toBe(true);
    expect(repoMock.delete).toHaveBeenCalledWith(1);
  });

  // FIND BY USERNAME
  test("getUsuarioByUsername() debe buscar usuario por nombre de usuario", async () => {
    repoMock.findByUsername.mockResolvedValue(mockUsuario);

    const result = await service.getUsuarioByUsername("Usuario Prueba");

    expect(result).toEqual(mockUsuario);
    expect(repoMock.findByUsername).toHaveBeenCalledWith("Usuario Prueba");
  });

  // FIND BY EMAIL
  test("getUsuarioByEmail() debe buscar usuario por correo", async () => {
    repoMock.findByEmail.mockResolvedValue(mockUsuario);

    const result = await service.getUsuarioByEmail("usuario@email.com");

    expect(result).toEqual(mockUsuario);
    expect(repoMock.findByEmail).toHaveBeenCalledWith("usuario@email.com");
  });

  // FIND BY ROL
  test("getUsuariosByRol() debe buscar usuarios por rol", async () => {
    repoMock.findByRol.mockResolvedValue([mockUsuario]);

    const result = await service.getUsuariosByRol("Administrador");

    expect(result).toEqual([mockUsuario]);
    expect(repoMock.findByRol).toHaveBeenCalledWith("Administrador");
  });

  // FIND BY ACTIVE STATUS
  test("getUsuariosByActiveStatus() debe buscar usuarios por estado activo", async () => {
    repoMock.findByActiveStatus.mockResolvedValue([mockUsuario]);

    const result = await service.getUsuariosByActiveStatus(true);

    expect(result).toEqual([mockUsuario]);
    expect(repoMock.findByActiveStatus).toHaveBeenCalledWith(true);
  });

  // FIND BY IDENTIFICADOR UNICO
  test("getUsuarioByIdentificadorUnico() debe buscar usuario por identificador único", async () => {
    repoMock.findByIdentificadorUnico.mockResolvedValue(mockUsuario);

    const result = await service.getUsuarioByIdentificadorUnico("ADMIN1");

    expect(result).toEqual(mockUsuario);
    expect(repoMock.findByIdentificadorUnico).toHaveBeenCalledWith("ADMIN1");
  });

  // FIND BY LOGIN CODE
  test("getUsuarioByLoginCode() debe buscar usuario por código de login", async () => {
    repoMock.findByLoginCode.mockResolvedValue(mockUsuario);

    const result = await service.getUsuarioByLoginCode("A1B2C3");

    expect(result).toEqual(mockUsuario);
    expect(repoMock.findByLoginCode).toHaveBeenCalledWith("A1B2C3");
  });

  // SEARCH by username OR email
  test("searchUsuarios() debe buscar usuarios por nombre de usuario o correo", async () => {
    repoMock.searchByUsernameOrEmail.mockResolvedValue([mockUsuario]);

    const result = await service.searchUsuarios("Usuario Prueba");

    expect(result).toEqual([mockUsuario]);
    expect(repoMock.searchByUsernameOrEmail).toHaveBeenCalledWith("Usuario Prueba");
  });

});
