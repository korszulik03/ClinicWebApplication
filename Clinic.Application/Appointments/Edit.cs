using Clinic.Infrastructure;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Appointments
{
    public class Edit
    {
        public class Command : IRequest
        {
            public int Id { get; set; }
            public DateTime DateTime { get; set; }
            public required string Status { get; set; }
            public string? Notes { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DateTime).NotEmpty();
                RuleFor(x => x.Status).NotEmpty();
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
                var appointment = await _context.Appointments.FindAsync(request.Id);

                if (appointment == null) return;

                appointment.DateTime = request.DateTime;
                appointment.Status = request.Status;
                appointment.Notes = request.Notes;

                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}