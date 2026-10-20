using Dapper;
using SistemaApoyoSocial.Api.Data;
using SistemaApoyoSocial.Api.DTOs;

namespace SistemaApoyoSocial.Api.Services;

public class ProgramaService : IProgramaService
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public ProgramaService(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    private const string ColumnasSelect = @"
        id AS Id, nombre AS Nombre, descripcion AS Descripcion, requisitos AS Requisitos,
        cupo_total AS CupoTotal, cupo_disponible AS CupoDisponible,
        fecha_inicio AS FechaInicio, fecha_fin AS FechaFin, estatus AS Estatus";

    public async Task<IEnumerable<ProgramaDto>> ObtenerVigentesAsync()
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = $"SELECT {ColumnasSelect} FROM programas WHERE estatus = 'activo' ORDER BY fecha_inicio DESC";
        return await connection.QueryAsync<ProgramaDto>(sql);
    }

    public async Task<IEnumerable<ProgramaDto>> ObtenerTodosAsync()
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = $"SELECT {ColumnasSelect} FROM programas ORDER BY creado_en DESC";
        return await connection.QueryAsync<ProgramaDto>(sql);
    }

    public async Task<ProgramaDto?> ObtenerPorIdAsync(Guid id)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = $"SELECT {ColumnasSelect} FROM programas WHERE id = @Id";
        return await connection.QuerySingleOrDefaultAsync<ProgramaDto>(sql, new { Id = id });
    }

    public async Task<ProgramaDto> CrearAsync(CrearProgramaDto dto)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = $@"
            INSERT INTO programas (nombre, descripcion, requisitos, cupo_total, cupo_disponible, fecha_inicio, fecha_fin, estatus)
            VALUES (@Nombre, @Descripcion, @Requisitos, @CupoTotal, @CupoTotal, @FechaInicio, @FechaFin, 'activo')
            RETURNING {ColumnasSelect}";

        return await connection.QuerySingleAsync<ProgramaDto>(sql, dto);
    }

    public async Task<ProgramaDto?> ActualizarAsync(Guid id, ActualizarProgramaDto dto)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = $@"
            UPDATE programas
            SET nombre = @Nombre, descripcion = @Descripcion, requisitos = @Requisitos,
                cupo_total = @CupoTotal, fecha_inicio = @FechaInicio, fecha_fin = @FechaFin
            WHERE id = @Id
            RETURNING {ColumnasSelect}";

        return await connection.QuerySingleOrDefaultAsync<ProgramaDto>(sql, new
        {
            Id = id,
            dto.Nombre,
            dto.Descripcion,
            dto.Requisitos,
            dto.CupoTotal,
            dto.FechaInicio,
            dto.FechaFin,
        });
    }

    public async Task<bool> CerrarAsync(Guid id)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var sql = "UPDATE programas SET estatus = 'cerrado' WHERE id = @Id";
        var filas = await connection.ExecuteAsync(sql, new { Id = id });
        return filas > 0;
    }
}
