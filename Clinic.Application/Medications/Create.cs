using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Medications
{
    public class Create
    {
        public class Command : IRequest
        {
            public required string Name { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Name).NotEmpty();
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
                var medication = new Medication
                {
                    Name = request.Name
                };

                _context.Medications.Add(medication);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}