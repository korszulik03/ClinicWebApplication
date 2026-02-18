using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Doctors
{
    public class List
    {
        public class Query : IRequest<List<DoctorDto>> { }
        public class Handler : IRequestHandler<Query, List<DoctorDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<DoctorDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Pobieramy lekarzy, dołączamy specjalizację i mapujemy na Dto
                var doctors = await _context.Doctors
                    .Include(d => d.Specialization)
                    .ProjectTo<DoctorDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);

                return doctors;
            }
        }
    }
}