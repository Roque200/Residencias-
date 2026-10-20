using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SistemaApoyoSocial.Api.Services;

public class SupabaseStorageService : ISupabaseStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _bucketName;
    private readonly string _baseUrl;

    public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;

        var supabaseSection = configuration.GetSection("Supabase");
        _baseUrl = supabaseSection["Url"]?.TrimEnd('/')
            ?? throw new InvalidOperationException("Falta configurar Supabase:Url");
        _bucketName = supabaseSection["BucketName"]
            ?? throw new InvalidOperationException("Falta configurar Supabase:BucketName");

        var serviceRoleKey = supabaseSection["ServiceRoleKey"]
            ?? throw new InvalidOperationException("Falta configurar Supabase:ServiceRoleKey");

        _httpClient.BaseAddress = new Uri(_baseUrl);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        _httpClient.DefaultRequestHeaders.Add("apikey", serviceRoleKey);
    }

    public async Task<string> SubirArchivoAsync(string rutaDestino, Stream contenido, string contentType)
    {
        using var streamContent = new StreamContent(contenido);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        var respuesta = await _httpClient.PostAsync(
            $"/storage/v1/object/{_bucketName}/{rutaDestino}",
            streamContent);

        if (!respuesta.IsSuccessStatusCode)
        {
            var error = await respuesta.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Error al subir el archivo a Supabase Storage: {error}");
        }

        return rutaDestino;
    }

    public async Task<string> GenerarUrlFirmadaAsync(string rutaArchivo, int expiracionSegundos = 300)
    {
        var body = new StringContent(
            JsonSerializer.Serialize(new { expiresIn = expiracionSegundos }),
            Encoding.UTF8,
            "application/json");

        var respuesta = await _httpClient.PostAsync(
            $"/storage/v1/object/sign/{_bucketName}/{rutaArchivo}",
            body);

        if (!respuesta.IsSuccessStatusCode)
        {
            var error = await respuesta.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Error al generar la URL firmada: {error}");
        }

        var contenido = await respuesta.Content.ReadAsStringAsync();
        using var documento = JsonDocument.Parse(contenido);
        var signedUrl = documento.RootElement.GetProperty("signedURL").GetString()!;

        return $"{_baseUrl}/storage/v1{signedUrl}";
    }
}
