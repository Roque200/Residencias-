using Dapper;
using SistemaApoyoSocial.Api.Data;
using SistemaApoyoSocial.Api.Models;

namespace SistemaApoyoSocial.Api.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public UsuarioService(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<Usuario?> ValidarCredencialesAsync(string correo, string password)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        const string sql = @"
            SELECT id AS Id, nombre AS Nombre, correo AS Correo,
                   contrasena_hash AS ContrasenaHash, rol AS Rol,
                   activo AS Activo, creado_en AS CreadoEn
            FROM usuarios
            WHERE correo = @Correo AND activo = true";

        var usuario = await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Correo = correo });

        if (usuario is null)
        {
            return null;
        }

        var passwordValida = BCrypt.Net.BCrypt.Verify(password, usuario.ContrasenaHash);
        return passwordValida ? usuario : null;
    }
}
