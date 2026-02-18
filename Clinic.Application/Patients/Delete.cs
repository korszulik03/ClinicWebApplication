using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Patients
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
                var patient = await _context.Patients.FindAsync(request.Id);
                if (patient == null) return;

                _context.Patients.Remove(patient);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}