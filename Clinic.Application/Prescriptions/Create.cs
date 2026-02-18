using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Prescriptions
{
    public class Create
    {
        // Klasa pomocnicza do przesyłania leku i dawki
        public class MedicationItem
        {
            public int MedicationId { get; set; }
            public required string Dosage { get; set; }
        }

        public class Command : IRequest
        {
            public int AppointmentId { get; set; }
            public List<MedicationItem> Medications { get; set; } = new List<MedicationItem>();
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.AppointmentId).GreaterThan(0);
                RuleFor(x => x.Medications).NotEmpty().WithMessage("Recepta musi zawierać przynajmniej jeden lek.");
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
                // 1. Sprawdzamy czy wizyta istnieje
                var appointment = await _context.Appointments.FindAsync(request.AppointmentId);
                if (appointment == null) throw new Exception("Wizyta nie istnieje"); // W przyszłości ładny błąd

                // 2. Tworzymy receptę
                var prescription = new Prescription
                {
                    AppointmentId = request.AppointmentId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Prescriptions.Add(prescription);
                // Ważne: Zapisujemy, żeby recepta dostała ID (potrzebne do tabeli łączącej)
                await _context.SaveChangesAsync(cancellationToken);

                // 3. Dodajemy leki do recepty
                foreach (var item in request.Medications)
                {
                    var pm = new PrescriptionMedication
                    {
                        PrescriptionId = prescription.Id,
                        MedicationId = item.MedicationId,
                        Dosage = item.Dosage
                    };
                    _context.PrescriptionMedications.Add(pm);
                }

                // 4. Zapisujemy leki
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}