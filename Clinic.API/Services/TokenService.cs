using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Clinic.Domain;
using Microsoft.IdentityModel.Tokens;

namespace Clinic.API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(AppUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var keyVal = _config["TokenKey"] ?? "5skVO4V!JFdc5uzuZs%xF@K$lWk^Rr1LPb$Kj6sek^MOVyvlk3$itG!$PaJOo4^r2H*Qq$D3a2iGebZGfsPf8txSQ95rICN$OHr7#0xAsk3TW^6xhnTM&mtrg9Zd&n$F";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyVal));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(10),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}