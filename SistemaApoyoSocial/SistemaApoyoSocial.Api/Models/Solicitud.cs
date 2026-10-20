namespace SistemaApoyoSocial.Api.Models;

public class Solicitud
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public Guid ProgramaId { get; set; }
    public string NombreSolicitante { get; set; } = string.Empty;
    public string Curp { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;
    public string Comunidad { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Estatus { get; set; } = string.Empty; // recibida | en_revision | aprobada | rechazada | entregada
    public DateTime FechaRegistro { get; set; }
}
