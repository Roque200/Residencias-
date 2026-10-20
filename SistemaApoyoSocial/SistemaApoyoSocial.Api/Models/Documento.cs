namespace SistemaApoyoSocial.Api.Models;

public class Documento
{
    public Guid Id { get; set; }
    public Guid SolicitudId { get; set; }
    public string TipoDocumento { get; set; } = string.Empty;
    public string UrlArchivo { get; set; } = string.Empty;
    public DateTime FechaCarga { get; set; }
}
