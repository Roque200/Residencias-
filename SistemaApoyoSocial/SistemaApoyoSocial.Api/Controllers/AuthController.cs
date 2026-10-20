using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.DTOs;
using SistemaApoyoSocial.Api.Services;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly IJwtService _jwtService;

    public AuthController(IUsuarioService usuarioService, IJwtService jwtService)
    {
        _usuarioService = usuarioService;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var usuario = await _usuarioService.ValidarCredencialesAsync(request.Correo, request.Password);

        if (usuario is null)
        {
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });
        }

        var token = _jwtService.GenerarToken(usuario);

        var respuesta = new LoginResponseDto
        {
            Token = token,
            Usuario = new UsuarioDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Correo = usuario.Correo,
                Rol = usuario.Rol,
            },
        };

        return Ok(respuesta);
    }
}
