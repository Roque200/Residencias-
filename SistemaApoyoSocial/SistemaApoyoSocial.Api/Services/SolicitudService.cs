using Dapper;
using SistemaApoyoSocial.Api.Data;
using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public class SolicitudService : ISolicitudService
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    private static readonly Dictionary<string, string[]> TransicionesPermitidas = new()
    {
        ["recibida"] = new[] { "en_revision" },
        ["en_revision"] = new[] { "aprobada", "rechazada" },
        ["aprobada"] = new[] { "entregada" },
        ["rechazada"] = Array.Empty<string>(),
        ["entregada"] = Array.Empty<string>(),
    };

    public SolicitudService(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<ResultadoCrearSolicitud> CrearAsync(CrearSolicitudDto dto)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var programa = await connection.QuerySingleOrDefaultAsync<(string Estatus, int CupoDisponible)?>(
            "SELECT estatus AS Estatus, cupo_disponible AS CupoDisponible FROM programas WHERE id = @ProgramaId",
            new { dto.ProgramaId });

        if (programa is null)
        {
            return new ResultadoCrearSolicitud { Exito = false, Error = "El programa indicado no existe." };
        }

        if (programa.Value.Estatus != "activo")
        {
            return new ResultadoCrearSolicitud { Exito = false, Error = "Este programa no está aceptando postulaciones en este momento." };
        }

        if (programa.Value.CupoDisponible <= 0)
        {
            return new ResultadoCrearSolicitud { Exito = false, Error = "Este programa ya no tiene cupo disponible." };
        }

        const string insertSql = @"
            INSERT INTO solicitudes (programa_id, nombre_solicitante, curp, domicilio, comunidad, telefono)
            VALUES (@ProgramaId, @NombreSolicitante, @Curp, @Domicilio, @Comunidad, @Telefono)
            RETURNING id AS Id, folio AS Folio, estatus AS Estatus, fecha_registro AS FechaRegistro";

        var solicitud = await connection.QuerySingleAsync<SolicitudCreadaDto>(insertSql, dto);

        const string historialSql = @"
            INSERT INTO historial_estatus (solicitud_id, estatus_anterior, estatus_nuevo, comentario)
            VALUES (@SolicitudId, NULL, 'recibida', 'Solicitud registrada por el ciudadano.')";

        await connection.ExecuteAsync(historialSql, new { SolicitudId = solicitud.Id });

        return new ResultadoCrearSolicitud { Exito = true, Solicitud = solicitud };
    }

    public async Task<ConsultaFolioDto?> ObtenerPorFolioAsync(string folio)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        const string sqlSolicitud = @"
            SELECT s.folio AS Folio, p.nombre AS Programa, s.estatus AS Estatus, s.id AS Id
            FROM solicitudes s
            JOIN programas p ON p.id = s.programa_id
            WHERE s.folio = @Folio";

        var datos = await connection.QuerySingleOrDefaultAsync<(string Folio, string Programa, string Estatus, Guid Id)?>(sqlSolicitud, new { Folio = folio });

        if (datos is null)
        {
            return null;
        }

        const string sqlHistorial = @"
            SELECT estatus_nuevo AS Estatus, fecha AS Fecha
            FROM historial_estatus
            WHERE solicitud_id = @SolicitudId
            ORDER BY fecha ASC";

        var historial = await connection.QueryAsync<HistorialItemDto>(sqlHistorial, new { SolicitudId = datos.Value.Id });

        return new ConsultaFolioDto
        {
            Folio = datos.Value.Folio,
            Programa = datos.Value.Programa,
            Estatus = datos.Value.Estatus,
            Historial = historial.ToList(),
        };
    }

    public async Task<IEnumerable<SolicitudListItemDto>> ObtenerConFiltrosAsync(
        Guid? programaId, string? comunidad, string? estatus, DateOnly? fechaDesde, DateOnly? fechaHasta)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var condiciones = new List<string>();
        var parametros = new DynamicParameters();

        if (programaId.HasValue)
        {
            condiciones.Add("s.programa_id = @ProgramaId");
            parametros.Add("ProgramaId", programaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(comunidad))
        {
            condiciones.Add("s.comunidad ILIKE @Comunidad");
            parametros.Add("Comunidad", $"%{comunidad}%");
        }

        if (!string.IsNullOrWhiteSpace(estatus))
        {
            condiciones.Add("s.estatus = @Estatus::estatus_solicitud");
            parametros.Add("Estatus", estatus);
        }

        if (fechaDesde.HasValue)
        {
            condiciones.Add("s.fecha_registro >= @FechaDesde");
            parametros.Add("FechaDesde", fechaDesde.Value.ToDateTime(TimeOnly.MinValue));
        }

        if (fechaHasta.HasValue)
        {
            condiciones.Add("s.fecha_registro <= @FechaHasta");
            parametros.Add("FechaHasta", fechaHasta.Value.ToDateTime(TimeOnly.MaxValue));
        }

        var whereClause = condiciones.Count > 0 ? "WHERE " + string.Join(" AND ", condiciones) : "";

        var sql = $@"
            SELECT s.id AS Id, s.folio AS Folio, p.nombre AS ProgramaNombre,
                   s.nombre_solicitante AS NombreSolicitante, s.comunidad AS Comunidad,
                   s.estatus AS Estatus, s.fecha_registro AS FechaRegistro
            FROM solicitudes s
            JOIN programas p ON p.id = s.programa_id
            {whereClause}
            ORDER BY s.fecha_registro DESC";

        return await connection.QueryAsync<SolicitudListItemDto>(sql, parametros);
    }

    public async Task<SolicitudDetalleDto?> ObtenerDetalleAsync(Guid id)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        const string sqlSolicitud = @"
            SELECT s.id AS Id, s.folio AS Folio, s.programa_id AS ProgramaId, p.nombre AS ProgramaNombre,
                   s.nombre_solicitante AS NombreSolicitante, s.curp AS Curp, s.domicilio AS Domicilio,
                   s.comunidad AS Comunidad, s.telefono AS Telefono, s.estatus AS Estatus,
                   s.fecha_registro AS FechaRegistro
            FROM solicitudes s
            JOIN programas p ON p.id = s.programa_id
            WHERE s.id = @Id";

        var solicitud = await connection.QuerySingleOrDefaultAsync<SolicitudDetalleDto>(sqlSolicitud, new { Id = id });

        if (solicitud is null)
        {
            return null;
        }

        const string sqlDocumentos = @"
            SELECT id AS Id, tipo_documento AS TipoDocumento, url_archivo AS UrlArchivo, fecha_carga AS FechaCarga
            FROM documentos
            WHERE solicitud_id = @Id
            ORDER BY fecha_carga ASC";

        const string sqlHistorial = @"
            SELECT estatus_anterior AS EstatusAnterior, estatus_nuevo AS EstatusNuevo,
                   comentario AS Comentario, fecha AS Fecha
            FROM historial_estatus
            WHERE solicitud_id = @Id
            ORDER BY fecha ASC";

        var documentos = await connection.QueryAsync<DocumentoDto>(sqlDocumentos, new { Id = id });
        var historial = await connection.QueryAsync<HistorialDetalleDto>(sqlHistorial, new { Id = id });

        solicitud.Documentos = documentos.ToList();
        solicitud.Historial = historial.ToList();

        return solicitud;
    }

    public async Task<ResultadoOperacion> CambiarEstatusAsync(Guid solicitudId, string estatusNuevo, string? comentario, Guid usuarioId)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        using var transaction = connection.BeginTransaction();

        try
        {
            var actual = await connection.QuerySingleOrDefaultAsync<(string Estatus, Guid ProgramaId)?>(
                "SELECT estatus AS Estatus, programa_id AS ProgramaId FROM solicitudes WHERE id = @Id FOR UPDATE",
                new { Id = solicitudId }, transaction);

            if (actual is null)
            {
                transaction.Rollback();
                return new ResultadoOperacion { Exito = false, Error = "La solicitud indicada no existe." };
            }

            var estatusActual = actual.Value.Estatus;

            if (!TransicionesPermitidas.TryGetValue(estatusActual, out var permitidas) || !permitidas.Contains(estatusNuevo))
            {
                transaction.Rollback();
                return new ResultadoOperacion
                {
                    Exito = false,
                    Error = $"No se puede cambiar de '{estatusActual}' a '{estatusNuevo}'. Revisa el flujo permitido de estatus.",
                };
            }

            if (estatusNuevo == "aprobada")
            {
                var cupoDisponible = await connection.QuerySingleAsync<int>(
                    "SELECT cupo_disponible FROM programas WHERE id = @ProgramaId FOR UPDATE",
                    new { actual.Value.ProgramaId }, transaction);

                if (cupoDisponible <= 0)
                {
                    transaction.Rollback();
                    return new ResultadoOperacion { Exito = false, Error = "El programa ya no tiene cupo disponible para aprobar esta solicitud." };
                }

                await connection.ExecuteAsync(
                    "UPDATE programas SET cupo_disponible = cupo_disponible - 1 WHERE id = @ProgramaId",
                    new { actual.Value.ProgramaId }, transaction);
            }

            await connection.ExecuteAsync(
                "UPDATE solicitudes SET estatus = @EstatusNuevo::estatus_solicitud WHERE id = @Id",
                new { EstatusNuevo = estatusNuevo, Id = solicitudId }, transaction);

            await connection.ExecuteAsync(@"
                INSERT INTO historial_estatus (solicitud_id, estatus_anterior, estatus_nuevo, usuario_id, comentario)
                VALUES (@SolicitudId, @EstatusAnterior::estatus_solicitud, @EstatusNuevo::estatus_solicitud, @UsuarioId, @Comentario)",
                new
                {
                    SolicitudId = solicitudId,
                    EstatusAnterior = estatusActual,
                    EstatusNuevo = estatusNuevo,
                    UsuarioId = usuarioId,
                    Comentario = comentario,
                }, transaction);

            transaction.Commit();
            return new ResultadoOperacion { Exito = true };
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
