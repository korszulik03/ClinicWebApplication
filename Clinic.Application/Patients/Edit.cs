using Clinic.Application.Core;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Patients
{
    public class Edit
    {
        public class Command : IRequest
        {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string PESEL { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            private readonly DataContext _context;

            public CommandValidator(DataContext context)
            {
                _context = context;

                RuleFor(x => x.FirstName).NotEmpty();
                RuleFor(x => x.LastName).NotEmpty();

                // Walidacja PESEL
                RuleFor(x => x.PESEL)
                    .NotEmpty()
                    .Length(11)
                    .Must(PeselUtils.IsValid).WithMessage("Nieprawidłowy numer PESEL.")
                    .MustAsync(async (command, pesel, cancellation) =>
                    {
                        var exists = await _context.Patients
                            .AnyAsync(x => x.PESEL == pesel && x.Id != command.Id, cancellation);
                        return !exists;
                    }).WithMessage("Inny pacjent posiada już ten numer PESEL.");

                // Walidacja Email
                RuleFor(x => x.Email)
                   .EmailAddress()
                   .When(x => !string.IsNullOrEmpty(x.Email))
                   .WithMessage("Niepoprawny format adresu email.");
            }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) { _context = context; }

            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var patient = await _context.Patients.FindAsync(request.Id);
                if (patient == null) return;

                patient.FirstName = request.FirstName ?? patient.FirstName;
                patient.LastName = request.LastName ?? patient.LastName;
                patient.Email = request.Email ?? patient.Email;
                patient.Phone = request.Phone ?? patient.Phone;

                if (!string.IsNullOrEmpty(request.PESEL)) patient.PESEL = request.PESEL;

                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}