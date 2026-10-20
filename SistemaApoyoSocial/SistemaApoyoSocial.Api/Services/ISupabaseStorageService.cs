namespace SistemaApoyoSocial.Api.Services;

public interface ISupabaseStorageService
{
    Task<string> SubirArchivoAsync(string rutaDestino, Stream contenido, string contentType);
    Task<string> GenerarUrlFirmadaAsync(string rutaArchivo, int expiracionSegundos = 300);
}
