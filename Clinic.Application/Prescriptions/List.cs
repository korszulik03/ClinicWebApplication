using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Prescriptions
{
    public class List
    {
        public class Query : IRequest<List<PrescriptionDto>> { }

        public class Handler : IRequestHandler<Query, List<PrescriptionDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<PrescriptionDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Prescriptions
                    .Include(p => p.PrescriptionMedications) // Załaduj tabelę łączącą
                    .ThenInclude(pm => pm.Medication)        // Załaduj nazwy leków
                    .ProjectTo<PrescriptionDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }
        }
    }
}