using Clinic.Application.Core;
using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Patients
{
    public class Create
    {
        public class Command : IRequest
        {
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

                RuleFor(x => x.FirstName).NotEmpty().WithMessage("Imię jest wymagane.");
                RuleFor(x => x.LastName).NotEmpty().WithMessage("Nazwisko jest wymagane.");

                RuleFor(x => x.PESEL)
                    .NotEmpty().WithMessage("PESEL jest wymagany.")
                    .Length(11).WithMessage("PESEL musi mieć 11 cyfr.")
                    .Must(PeselUtils.IsValid).WithMessage("Nieprawidłowy numer PESEL.")
                    .MustAsync(async (pesel, cancellation) =>
                    {
                        var exists = await _context.Patients.AnyAsync(x => x.PESEL == pesel, cancellation);
                        return !exists;
                    }).WithMessage("Pacjent z takim numerem PESEL już istnieje.");

              
                RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Niepoprawny format email.");
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
                var patient = new Patient
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email ?? "Brak",
                    Phone = request.Phone ?? "Brak",
                    PESEL = request.PESEL
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}