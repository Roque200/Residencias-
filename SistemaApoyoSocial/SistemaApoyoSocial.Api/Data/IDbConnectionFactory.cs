using System.Data;

namespace SistemaApoyoSocial.Api.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
