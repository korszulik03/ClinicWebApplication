using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Doctors
{
    public class Details
    {
        public class Query : IRequest<DoctorDto>
        {
            public int Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, DoctorDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<DoctorDto> Handle(Query request, CancellationToken cancellationToken)
            {
                var doctor = await _context.Doctors
                    .Include(d => d.Specialization)
                    .ProjectTo<DoctorDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(x => x.Id == request.Id);

                return doctor;
            }
        }
    }
}