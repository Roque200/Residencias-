using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public interface IReporteService
{
    Task<ResumenDto> ObtenerResumenAsync();
    Task<byte[]> GenerarExcelSolicitudesAsync(
        Guid? programaId, string? comunidad, string? estatus, DateOnly? fechaDesde, DateOnly? fechaHasta);
}
