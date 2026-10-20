using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.Data;
using SistemaApoyoSocial.Api.DTOs;
using SistemaApoyoSocial.Api.Services;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/solicitudes/{solicitudId:guid}/documentos")]
public class DocumentosController : ControllerBase
{
    private readonly IDbConnectionFactory _dbConnectionFactory;
    private readonly ISupabaseStorageService _storageService;

    private static readonly string[] TiposPermitidos = { "application/pdf", "image/jpeg", "image/png" };
    private const long TamanoMaximoBytes = 10 * 1024 * 1024;

    public DocumentosController(IDbConnectionFactory dbConnectionFactory, ISupabaseStorageService storageService)
    {
        _dbConnectionFactory = dbConnectionFactory;
        _storageService = storageService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Subir(Guid solicitudId, [FromForm] string tipoDocumento, [FromForm] IFormFile archivo)
    {
        if (archivo is null || archivo.Length == 0)
        {
            return BadRequest(new { mensaje = "Debes adjuntar un archivo." });
        }

        if (archivo.Length > TamanoMaximoBytes)
        {
            return BadRequest(new { mensaje = "El archivo excede el límite de 10 MB." });
        }

        if (!TiposPermitidos.Contains(archivo.ContentType))
        {
            return BadRequest(new { mensaje = "Tipo de archivo no permitido. Solo se aceptan PDF, JPG o PNG." });
        }

        using var connection = _dbConnectionFactory.CreateConnection();
        var existeSolicitud = await connection.QuerySingleOrDefaultAsync<Guid?>(
            "SELECT id FROM solicitudes WHERE id = @Id", new { Id = solicitudId });

        if (existeSolicitud is null)
        {
            return NotFound(new { mensaje = "La solicitud indicada no existe." });
        }

        var extension = Path.GetExtension(archivo.FileName);
        var rutaDestino = $"solicitudes/{solicitudId}/{Guid.NewGuid()}{extension}";

        await using var stream = archivo.OpenReadStream();
        await _storageService.SubirArchivoAsync(rutaDestino, stream, archivo.ContentType);

        const string insertSql = @"
            INSERT INTO documentos (solicitud_id, tipo_documento, url_archivo)
            VALUES (@SolicitudId, @TipoDocumento, @UrlArchivo)
            RETURNING id AS Id, tipo_documento AS TipoDocumento, url_archivo AS UrlArchivo, fecha_carga AS FechaCarga";

        var documento = await connection.QuerySingleAsync<DocumentoDto>(insertSql, new
        {
            SolicitudId = solicitudId,
            TipoDocumento = tipoDocumento,
            UrlArchivo = rutaDestino,
        });

        return CreatedAtAction(nameof(Listar), new { solicitudId }, documento);
    }

    [HttpGet]
    [Authorize(Roles = "capturista,revisor,administrador")]
    public async Task<IActionResult> Listar(Guid solicitudId)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var documentos = await connection.QueryAsync<DocumentoDto>(
            @"SELECT id AS Id, tipo_documento AS TipoDocumento, url_archivo AS UrlArchivo, fecha_carga AS FechaCarga
              FROM documentos WHERE solicitud_id = @SolicitudId ORDER BY fecha_carga ASC",
            new { SolicitudId = solicitudId });

        var resultado = new List<DocumentoDto>();
        foreach (var doc in documentos)
        {
            var urlFirmada = await _storageService.GenerarUrlFirmadaAsync(doc.UrlArchivo, 600);
            resultado.Add(new DocumentoDto
            {
                Id = doc.Id,
                TipoDocumento = doc.TipoDocumento,
                UrlArchivo = urlFirmada,
                FechaCarga = doc.FechaCarga,
            });
        }

        return Ok(resultado);
    }
}
