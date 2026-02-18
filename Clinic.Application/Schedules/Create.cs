using Clinic.Domain;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Schedules
{
    public class Create
    {
        public class Command : IRequest
        {
            public int DoctorId { get; set; }
            public int DayOfWeek { get; set; } // 1-7
            public TimeSpan StartTime { get; set; } // np. "08:00:00"
            public TimeSpan EndTime { get; set; }   // np. "16:00:00"
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DoctorId).GreaterThan(0);
                RuleFor(x => x.DayOfWeek).InclusiveBetween(0, 6); // 0=Niedziela, 6=Sobota
                RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime)
                    .WithMessage("Godzina zakończenia musi być późniejsza niż rozpoczęcia.");
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
                var schedule = new Schedule
                {
                    DoctorId = request.DoctorId,
                    DayOfWeek = request.DayOfWeek,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime
                };

                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}