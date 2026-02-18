using Clinic.Application.DTOs;
using Clinic.Application.Schedules;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SchedulesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/schedules?doctorId=1
        [HttpGet]
        public async Task<ActionResult<List<ScheduleDto>>> GetSchedules([FromQuery] int? doctorId)
        {
            return await _mediator.Send(new List.Query { DoctorId = doctorId });
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule(Create.Command command)
        {
            await _mediator.Send(command);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            await _mediator.Send(new Delete.Command { Id = id });
            return Ok();
        }
    }
}