using Clinic.API.DTOs;
using Clinic.API.Services;
using Clinic.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Clinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;

        public AccountController(UserManager<AppUser> userManager, TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null) return Unauthorized("Nieprawidłowy email");

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (result)
            {
                return CreateUserObject(user);
            }

            return Unauthorized("Nieprawidłowe hasło");
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            // Sprawdzamy czy email jest zajęty
            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                return BadRequest("Email jest już zajęty");
            }

            // Sprawdzamy czy login jest zajęty
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.UserName))
            {
                return BadRequest("Nazwa użytkownika jest już zajęta");
            }

            var user = new AppUser
            {
                // Tutaj przypisujemy DisplayName.
                // Ponieważ w RegisterDto mamy tylko UserName, używamy go też jako nazwy wyświetlanej.
                DisplayName = registerDto.UserName,
                Email = registerDto.Email,
                UserName = registerDto.UserName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (result.Succeeded)
            {
                return CreateUserObject(user);
            }

            return BadRequest(result.Errors);
        }

        // Metoda pomocnicza do tworzenia obiektu, który odsyłamy do użytkownika (z tokenem)
        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                // Zabezpieczenie: jeśli DisplayName byłby nullem, użyj UserName
                DisplayName = user.DisplayName ?? user.UserName,
                Token = _tokenService.CreateToken(user),
                UserName = user.UserName
            };
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            // Pobieramy email z tokena (User.FindFirstValue(ClaimTypes.Email))
            // Ale bezpieczniej poszukać po emailu w bazie
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));

            return CreateUserObject(user);
        }
    }
}