using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Appointments
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
                var appointment = await _context.Appointments.FindAsync(request.Id);

                if (appointment == null) return;

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}