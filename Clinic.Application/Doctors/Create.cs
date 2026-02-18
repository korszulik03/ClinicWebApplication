using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Doctors
{
    public class Create
    {
        // Komenda - jakie dane przesyłamy, żeby stworzyć lekarza
        public class Command : IRequest
        {
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public int SpecializationId { get; set; }
        }

        // Walidacja - sprawdzamy poprawność danych przed zapisem
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.FirstName).NotEmpty();
                RuleFor(x => x.LastName).NotEmpty();
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
                RuleFor(x => x.SpecializationId).GreaterThan(0);
            }
        }

        // Handler - logika zapisu do bazy
        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task Handle(Command request, CancellationToken cancellationToken)
            {
                var doctor = new Doctor
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    SpecializationId = request.SpecializationId
                };

                _context.Doctors.Add(doctor);

                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}