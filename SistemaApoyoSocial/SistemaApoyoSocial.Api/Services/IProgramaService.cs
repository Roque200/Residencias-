using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public interface IProgramaService
{
    Task<IEnumerable<ProgramaDto>> ObtenerVigentesAsync();
    Task<IEnumerable<ProgramaDto>> ObtenerTodosAsync();
    Task<ProgramaDto?> ObtenerPorIdAsync(Guid id);
    Task<ProgramaDto> CrearAsync(CrearProgramaDto dto);
    Task<ProgramaDto?> ActualizarAsync(Guid id, ActualizarProgramaDto dto);
    Task<bool> CerrarAsync(Guid id);
}
