using SistemaApoyoSocial.Api.Models;

namespace SistemaApoyoSocial.Api.Services;

public interface IUsuarioService
{
    Task<Usuario?> ValidarCredencialesAsync(string correo, string password);
}
