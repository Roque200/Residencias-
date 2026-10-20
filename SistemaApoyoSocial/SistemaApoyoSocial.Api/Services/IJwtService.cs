using SistemaApoyoSocial.Api.Models;

namespace SistemaApoyoSocial.Api.Services;

public interface IJwtService
{
    string GenerarToken(Usuario usuario);
}
