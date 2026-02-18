using Clinic.Application.Doctors;
using Clinic.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    public class DoctorsController : BaseApiController
    {
        // GET: api/doctors
        [HttpGet]
        public async Task<ActionResult<List<DoctorDto>>> GetDoctors()
        {
            return await Mediator.Send(new List.Query());
        }

        // GET: api/doctors/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            return await Mediator.Send(new Details.Query { Id = id });
        }

        // POST: api/doctors
        [HttpPost]
        public async Task<IActionResult> CreateDoctor(Create.Command command)
        {
            await Mediator.Send(command);
            return Ok();
        }

        // PUT: api/doctors/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> EditDoctor(int id, Edit.Command command)
        {
            command.Id = id;
            await Mediator.Send(command);
            return Ok();
        }

        // DELETE: api/doctors/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            await Mediator.Send(new Delete.Command { Id = id });
            return Ok();
        }
    }
}