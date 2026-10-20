namespace SistemaApoyoSocial.Api.DTOs;

public class CrearSolicitudDto
{
    public Guid ProgramaId { get; set; }
    public string NombreSolicitante { get; set; } = string.Empty;
    public string Curp { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;
    public string Comunidad { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
}

public class SolicitudCreadaDto
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public string Estatus { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public class HistorialItemDto
{
    public string Estatus { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}

public class ConsultaFolioDto
{
    public string Folio { get; set; } = string.Empty;
    public string Programa { get; set; } = string.Empty;
    public string Estatus { get; set; } = string.Empty;
    public List<HistorialItemDto> Historial { get; set; } = new();
}

public class ResultadoCrearSolicitud
{
    public bool Exito { get; set; }
    public string? Error { get; set; }
    public SolicitudCreadaDto? Solicitud { get; set; }
}
