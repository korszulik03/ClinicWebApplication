using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Schedules
{
    public class Delete
    {
        public class Command : IRequest
        {
            public int Id { get; set; }
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
                var schedule = await _context.Schedules.FindAsync(request.Id);
                if (schedule == null) return;

                _context.Schedules.Remove(schedule);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}