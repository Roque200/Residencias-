using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.Services;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/reportes")]
[Authorize(Roles = "administrador")]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;

    public ReportesController(IReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    [HttpGet("resumen")]
    public async Task<IActionResult> ObtenerResumen()
    {
        var resumen = await _reporteService.ObtenerResumenAsync();
        return Ok(resumen);
    }

    [HttpGet("solicitudes")]
    public async Task<IActionResult> ExportarSolicitudes(
        [FromQuery] Guid? programaId,
        [FromQuery] string? comunidad,
        [FromQuery] string? estatus,
        [FromQuery] DateOnly? fechaDesde,
        [FromQuery] DateOnly? fechaHasta)
    {
        var archivo = await _reporteService.GenerarExcelSolicitudesAsync(programaId, comunidad, estatus, fechaDesde, fechaHasta);

        var nombreArchivo = $"solicitudes_{DateTime.UtcNow:yyyyMMdd_HHmm}.xlsx";
        return File(
            archivo,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            nombreArchivo);
    }
}
