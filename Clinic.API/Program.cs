using System.Text;
using Clinic.Domain;
using Clinic.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Clinic.Application.Doctors;
using Clinic.Application.Core;
using Clinic.API.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using FluentValidation;
using MediatR;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

builder.Services.AddValidatorsFromAssemblyContaining<Clinic.Application.Doctors.Create>();

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Clinic API", Version = "v1" });
    c.CustomSchemaIds(type => type.ToString().Replace("+", "."));

    var securitySchema = new OpenApiSecurityScheme
    {
        Description = "Autoryzacja JWT. Wpisz 'Bearer {twoj_token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securitySchema);

    var securityRequirement = new OpenApiSecurityRequirement
    {
        { securitySchema, new[] { "Bearer" } }
    };

    c.AddSecurityRequirement(securityRequirement);
});

// BAZA DANYCH
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(connectionString);
});

// SERWISY APLIKACJI
builder.Services.AddScoped<TokenService>(); // Rejestracja serwisu tokenów
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(List).Assembly));
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

// IDENTITY
builder.Services.AddIdentityCore<AppUser>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
    opt.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<DataContext>()
.AddSignInManager<SignInManager<AppUser>>();

// AUTENTYKACJA (JWT)
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["TokenKey"] ?? "5skVO4V!JFdc5uzuZs%xF@K$lWk^Rr1LPb$Kj6sek^MOVyvlk3$itG!$PaJOo4^r2H*Qq$D3a2iGebZGfsPf8txSQ95rICN$OHr7#0xAsk3TW^6xhnTM&mtrg9Zd&n$F"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// CORS
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
    });
});

var app = builder.Build();
app.UseMiddleware<Clinic.API.Middleware.ExceptionMiddleware>();
app.UseCors("CorsPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    
    await context.Database.MigrateAsync();

    await Seed.SeedData(context, userManager);
    
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("--> Migracje i Seedowanie wykonane pomyœlnie.");
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "B³¹d startu aplikacji.");
}

app.Run();