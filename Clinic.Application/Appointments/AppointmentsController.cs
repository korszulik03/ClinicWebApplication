using Clinic.Application.Appointments;
using Clinic.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // Zmieniamy dziedziczenie na standardowe ControllerBase
    public class AppointmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        // Wstrzykujemy Mediator przez konstruktor (zamiast dziedziczyć z BaseApiController)
        public AppointmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAppointments()
        {
            return await _mediator.Send(new List.Query());
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment(Create.Command command)
        {
            await _mediator.Send(command);
            return Ok();
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> EditAppointment(int id, Edit.Command command)
        {
            command.Id = id;
            await _mediator.Send(command);
            return Ok();
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            await _mediator.Send(new Delete.Command { Id = id });
            return Ok();
        }
    }
}