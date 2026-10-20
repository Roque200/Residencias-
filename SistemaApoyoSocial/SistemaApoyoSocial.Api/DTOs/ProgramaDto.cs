namespace SistemaApoyoSocial.Api.DTOs;

public class ProgramaDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Requisitos { get; set; } = string.Empty;
    public int CupoTotal { get; set; }
    public int CupoDisponible { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public string Estatus { get; set; } = string.Empty;
}

public class CrearProgramaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Requisitos { get; set; } = string.Empty;
    public int CupoTotal { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
}

public class ActualizarProgramaDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Requisitos { get; set; } = string.Empty;
    public int CupoTotal { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
}
