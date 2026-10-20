using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public interface ISolicitudService
{
    Task<ResultadoCrearSolicitud> CrearAsync(CrearSolicitudDto dto);
    Task<ConsultaFolioDto?> ObtenerPorFolioAsync(string folio);
    Task<IEnumerable<SolicitudListItemDto>> ObtenerConFiltrosAsync(
        Guid? programaId, string? comunidad, string? estatus, DateOnly? fechaDesde, DateOnly? fechaHasta);
    Task<SolicitudDetalleDto?> ObtenerDetalleAsync(Guid id);
    Task<ResultadoOperacion> CambiarEstatusAsync(Guid solicitudId, string estatusNuevo, string? comentario, Guid usuarioId);
}
