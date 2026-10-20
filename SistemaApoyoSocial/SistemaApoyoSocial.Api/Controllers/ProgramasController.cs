using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.DTOs;
using SistemaApoyoSocial.Api.Services;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/programas")]
public class ProgramasController : ControllerBase
{
    private readonly IProgramaService _programaService;

    public ProgramasController(IProgramaService programaService)
    {
        _programaService = programaService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerVigentes()
    {
        var programas = await _programaService.ObtenerVigentesAsync();
        return Ok(programas);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerPorId(Guid id)
    {
        var programa = await _programaService.ObtenerPorIdAsync(id);
        return programa is null ? NotFound() : Ok(programa);
    }

    [HttpGet("todos")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> ObtenerTodos()
    {
        var programas = await _programaService.ObtenerTodosAsync();
        return Ok(programas);
    }

    [HttpPost]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Crear([FromBody] CrearProgramaDto dto)
    {
        var programa = await _programaService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = programa.Id }, programa);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarProgramaDto dto)
    {
        var programa = await _programaService.ActualizarAsync(id, dto);
        return programa is null ? NotFound() : Ok(programa);
    }

    [HttpPatch("{id:guid}/cerrar")]
    [Authorize(Roles = "administrador")]
    public async Task<IActionResult> Cerrar(Guid id)
    {
        var exito = await _programaService.CerrarAsync(id);
        return exito ? NoContent() : NotFound();
    }
}
