using Clinic.Application.DTOs;
using Clinic.Application.Prescriptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PrescriptionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<PrescriptionDto>>> GetPrescriptions()
        {
            return await _mediator.Send(new List.Query());
        }

        [HttpPost]
        public async Task<IActionResult> CreatePrescription(Create.Command command)
        {
            await _mediator.Send(command);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            await _mediator.Send(new Clinic.Application.Prescriptions.Delete.Command { Id = id });
            return Ok();
        }
    }
}