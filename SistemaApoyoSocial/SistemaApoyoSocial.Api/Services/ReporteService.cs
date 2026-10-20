using ClosedXML.Excel;
using Dapper;
using SistemaApoyoSocial.Api.Data;
using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public class ReporteService : IReporteService
{
    private readonly IDbConnectionFactory _dbConnectionFactory;
    private readonly ISolicitudService _solicitudService;

    public ReporteService(IDbConnectionFactory dbConnectionFactory, ISolicitudService solicitudService)
    {
        _dbConnectionFactory = dbConnectionFactory;
        _solicitudService = solicitudService;
    }

    public async Task<ResumenDto> ObtenerResumenAsync()
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var porEstatus = await connection.QueryAsync<(string Estatus, int Total)>(
            "SELECT estatus AS Estatus, COUNT(*) AS Total FROM solicitudes GROUP BY estatus");

        var porPrograma = await connection.QueryAsync<(string Programa, int Total)>(@"
            SELECT p.nombre AS Programa, COUNT(*) AS Total
            FROM solicitudes s
            JOIN programas p ON p.id = s.programa_id
            GROUP BY p.nombre");

        var resumen = new ResumenDto
        {
            PorEstatus = porEstatus.ToDictionary(x => x.Estatus, x => x.Total),
            PorPrograma = porPrograma.ToDictionary(x => x.Programa, x => x.Total),
        };

        resumen.TotalSolicitudes = resumen.PorEstatus.Values.Sum();

        return resumen;
    }

    public async Task<byte[]> GenerarExcelSolicitudesAsync(
        Guid? programaId, string? comunidad, string? estatus, DateOnly? fechaDesde, DateOnly? fechaHasta)
    {
        var solicitudes = await _solicitudService.ObtenerConFiltrosAsync(programaId, comunidad, estatus, fechaDesde, fechaHasta);

        using var workbook = new XLWorkbook();
        var hoja = workbook.Worksheets.Add("Solicitudes");

        var encabezados = new[] { "Folio", "Programa", "Solicitante", "Comunidad", "Estatus", "Fecha de registro" };
        for (var i = 0; i < encabezados.Length; i++)
        {
            hoja.Cell(1, i + 1).Value = encabezados[i];
            hoja.Cell(1, i + 1).Style.Font.Bold = true;
            hoja.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1F4E3D");
            hoja.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        var fila = 2;
        foreach (var s in solicitudes)
        {
            hoja.Cell(fila, 1).Value = s.Folio;
            hoja.Cell(fila, 2).Value = s.ProgramaNombre;
            hoja.Cell(fila, 3).Value = s.NombreSolicitante;
            hoja.Cell(fila, 4).Value = s.Comunidad;
            hoja.Cell(fila, 5).Value = s.Estatus;
            hoja.Cell(fila, 6).Value = s.FechaRegistro;
            hoja.Cell(fila, 6).Style.DateFormat.Format = "dd/mm/yyyy hh:mm";
            fila++;
        }

        hoja.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
