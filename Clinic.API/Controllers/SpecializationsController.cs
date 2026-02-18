using Clinic.Application.Specializations;
using Clinic.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    public class SpecializationsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<Specialization>>> GetSpecializations()
        {
            return await Mediator.Send(new List.Query());
        }
    }
}