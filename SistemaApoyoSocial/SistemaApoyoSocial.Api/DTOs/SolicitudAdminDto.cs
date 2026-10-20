namespace SistemaApoyoSocial.Api.DTOs;

public class SolicitudListItemDto
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public string ProgramaNombre { get; set; } = string.Empty;
    public string NombreSolicitante { get; set; } = string.Empty;
    public string Comunidad { get; set; } = string.Empty;
    public string Estatus { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public class DocumentoDto
{
    public Guid Id { get; set; }
    public string TipoDocumento { get; set; } = string.Empty;
    public string UrlArchivo { get; set; } = string.Empty;
    public DateTime FechaCarga { get; set; }
}

public class HistorialDetalleDto
{
    public string? EstatusAnterior { get; set; }
    public string EstatusNuevo { get; set; } = string.Empty;
    public string? Comentario { get; set; }
    public DateTime Fecha { get; set; }
}

public class SolicitudDetalleDto
{
    public Guid Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public Guid ProgramaId { get; set; }
    public string ProgramaNombre { get; set; } = string.Empty;
    public string NombreSolicitante { get; set; } = string.Empty;
    public string Curp { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;
    public string Comunidad { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Estatus { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public List<DocumentoDto> Documentos { get; set; } = new();
    public List<HistorialDetalleDto> Historial { get; set; } = new();
}

public class CambiarEstatusDto
{
    public string EstatusNuevo { get; set; } = string.Empty;
    public string? Comentario { get; set; }
}

public class ResultadoOperacion
{
    public bool Exito { get; set; }
    public string? Error { get; set; }
}
