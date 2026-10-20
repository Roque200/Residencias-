namespace SistemaApoyoSocial.Api.Models;

public class Usuario
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string ContrasenaHash { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty; // capturista | revisor | administrador
    public bool Activo { get; set; }
    public DateTime CreadoEn { get; set; }
}
