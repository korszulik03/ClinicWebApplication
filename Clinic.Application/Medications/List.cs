using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Medications
{
    public class List
    {
        public class Query : IRequest<List<MedicationDto>> { }

        public class Handler : IRequestHandler<Query, List<MedicationDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<MedicationDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Medications
                    .ProjectTo<MedicationDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }
        }
    }
}