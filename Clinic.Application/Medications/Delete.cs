using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Medications
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
                var medication = await _context.Medications.FindAsync(request.Id);

                if (medication == null) return;

                _context.Medications.Remove(medication);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}