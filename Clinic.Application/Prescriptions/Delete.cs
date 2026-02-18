using Clinic.Infrastructure;
using MediatR;

namespace Clinic.Application.Prescriptions
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
                var prescription = await _context.Prescriptions.FindAsync(request.Id);
                if (prescription == null) return;

                // EF Core automatycznie usunie powiązane leki (Cascade Delete), 
                // ponieważ klucz obcy w tabeli łączącej jest wymagany.
                _context.Prescriptions.Remove(prescription);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}