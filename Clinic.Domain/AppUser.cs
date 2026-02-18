using Microsoft.AspNetCore.Identity;

namespace Clinic.Domain
{
    public class AppUser : IdentityUser
    {
        public string? DisplayName { get; set; }

        public string? Role { get; set; }
        public int? LinkedPersonId { get; set; }
    }
}