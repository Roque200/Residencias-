namespace SistemaApoyoSocial.Api.Models;

public class HistorialEstatus
{
    public Guid Id { get; set; }
    public Guid SolicitudId { get; set; }
    public string? EstatusAnterior { get; set; }
    public string EstatusNuevo { get; set; } = string.Empty;
    public Guid? UsuarioId { get; set; }
    public string? Comentario { get; set; }
    public DateTime Fecha { get; set; }
}
