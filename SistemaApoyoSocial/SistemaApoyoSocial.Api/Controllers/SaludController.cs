using Dapper;
using Microsoft.AspNetCore.Mvc;
using SistemaApoyoSocial.Api.Data;

namespace SistemaApoyoSocial.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SaludController : ControllerBase
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public SaludController(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    [HttpGet("db")]
    public IActionResult ProbarConexionBaseDeDatos()
    {
        try
        {
            using var connection = _dbConnectionFactory.CreateConnection();
            var resultado = connection.QuerySingle<int>("SELECT 1");
            return Ok(new { conectado = resultado == 1 });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { conectado = false, error = ex.Message });
        }
    }
}
