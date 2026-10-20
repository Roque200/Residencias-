using System.Data;
using Npgsql;

namespace SistemaApoyoSocial.Api.Data;

public class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public NpgsqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase' en la configuración.");
    }

    public IDbConnection CreateConnection()
    {
        var connection = new NpgsqlConnection(_connectionString);
        connection.Open();
        return connection;
    }
}
