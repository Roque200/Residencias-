namespace SistemaApoyoSocial.Api.DTOs;

public class ResumenDto
{
    public int TotalSolicitudes { get; set; }
    public Dictionary<string, int> PorEstatus { get; set; } = new();
    public Dictionary<string, int> PorPrograma { get; set; } = new();
}
