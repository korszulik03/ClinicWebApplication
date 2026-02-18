using Clinic.Application.DTOs;
using Clinic.Application.Patients;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.API.Controllers
{
    public class PatientsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<PatientDto>>> GetPatients()
        {
            return await Mediator.Send(new List.Query());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            return await Mediator.Send(new Details.Query { Id = id });
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient(Create.Command command)
        {
            await Mediator.Send(command);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditPatient(int id, Edit.Command command)
        {
            command.Id = id;
            await Mediator.Send(command);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            await Mediator.Send(new Delete.Command { Id = id });
            return Ok();
        }
    }
}