using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.DTOs;
using SistemaApoyoSocial.Api.Services;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/solicitudes")]
public class SolicitudesController : ControllerBase
{
    private readonly ISolicitudService _solicitudService;

    public SolicitudesController(ISolicitudService solicitudService)
    {
        _solicitudService = solicitudService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Crear([FromBody] CrearSolicitudDto dto)
    {
        var resultado = await _solicitudService.CrearAsync(dto);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Error });
        }

        return CreatedAtAction(nameof(ObtenerPorFolio), new { folio = resultado.Solicitud!.Folio }, resultado.Solicitud);
    }

    [HttpGet("folio/{folio}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorFolio(string folio)
    {
        var consulta = await _solicitudService.ObtenerPorFolioAsync(folio);
        return consulta is null
            ? NotFound(new { mensaje = "No se encontró ninguna solicitud con ese folio." })
            : Ok(consulta);
    }

    [HttpGet]
    [Authorize(Roles = "capturista,revisor,administrador")]
    public async Task<IActionResult> Listar(
        [FromQuery] Guid? programaId,
        [FromQuery] string? comunidad,
        [FromQuery] string? estatus,
        [FromQuery] DateOnly? fechaDesde,
        [FromQuery] DateOnly? fechaHasta)
    {
        var solicitudes = await _solicitudService.ObtenerConFiltrosAsync(programaId, comunidad, estatus, fechaDesde, fechaHasta);
        return Ok(solicitudes);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "capturista,revisor,administrador")]
    public async Task<IActionResult> ObtenerDetalle(Guid id)
    {
        var detalle = await _solicitudService.ObtenerDetalleAsync(id);
        return detalle is null ? NotFound() : Ok(detalle);
    }

    [HttpPatch("{id:guid}/estatus")]
    [Authorize(Roles = "revisor,administrador")]
    public async Task<IActionResult> CambiarEstatus(Guid id, [FromBody] CambiarEstatusDto dto)
    {
        var usuarioIdTexto = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (usuarioIdTexto is null || !Guid.TryParse(usuarioIdTexto, out var usuarioId))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario del token." });
        }

        var resultado = await _solicitudService.CambiarEstatusAsync(id, dto.EstatusNuevo, dto.Comentario, usuarioId);

        return resultado.Exito
            ? NoContent()
            : BadRequest(new { mensaje = resultado.Error });
    }
}
