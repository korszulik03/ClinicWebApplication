using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Doctors
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
                var doctor = await _context.Doctors.FindAsync(request.Id);

                if (doctor == null) return;

                _context.Doctors.Remove(doctor);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}