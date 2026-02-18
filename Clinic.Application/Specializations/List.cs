using Clinic.Domain;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Specializations
{
    public class List
    {
        public class Query : IRequest<List<Specialization>> { }

        public class Handler : IRequestHandler<Query, List<Specialization>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<List<Specialization>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Zwracamy wszystkie dostępne specjalizacje z bazy
                return await _context.Specializations.ToListAsync(cancellationToken);
            }
        }
    }
}