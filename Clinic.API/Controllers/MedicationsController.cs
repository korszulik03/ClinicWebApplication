using Clinic.Application.DTOs;
using Clinic.Application.Medications;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MedicationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<MedicationDto>>> GetMedications()
        {
            return await _mediator.Send(new List.Query());
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedication(Create.Command command)
        {
            await _mediator.Send(command);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedication(int id)
        {
            await _mediator.Send(new Clinic.Application.Medications.Delete.Command { Id = id });
            return Ok();
        }
    }
}