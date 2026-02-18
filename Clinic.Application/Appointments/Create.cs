using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Appointments
{
    public class Create
    {
        public class Command : IRequest
        {
            public DateTime DateTime { get; set; }
            public int DoctorId { get; set; }
            public int PatientId { get; set; }
            public string? Notes { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DateTime).NotEmpty();
                RuleFor(x => x.DoctorId).GreaterThan(0);
                RuleFor(x => x.PatientId).GreaterThan(0);
            }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                // === 1. WALIDACJA GRAFIKU (NOWOŚĆ) ===

                // Pobieramy dzień tygodnia z daty wizyty (0 = Niedziela, 1 = Poniedziałek...)
                var dayOfWeek = (int)request.DateTime.DayOfWeek;

                // Pobieramy samą godzinę wizyty
                var timeOfDay = request.DateTime.TimeOfDay;

                // Szukamy w bazie grafiku tego lekarza na ten konkretny dzień
                var schedule = await _context.Schedules
                    .FirstOrDefaultAsync(x => x.DoctorId == request.DoctorId && x.DayOfWeek == dayOfWeek, cancellationToken);

                // Scenariusz A: Lekarz w ogóle nie ma wpisanego grafiku na ten dzień
                if (schedule == null)
                {
                    throw new Exception("Lekarz nie przyjmuje w ten dzień tygodnia.");
                }

                // Scenariusz B: Lekarz pracuje, ale wizyta jest za wcześnie lub za późno
                if (timeOfDay < schedule.StartTime || timeOfDay > schedule.EndTime)
                {
                    throw new Exception($"Lekarz przyjmuje w ten dzień tylko w godzinach {schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm}.");
                }

                var appointment = new Appointment
                {
                    DateTime = request.DateTime,
                    DoctorId = request.DoctorId,
                    PatientId = request.PatientId,
                    Notes = request.Notes,
                    Status = "Scheduled"
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}