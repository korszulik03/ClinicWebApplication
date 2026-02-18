using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Schedules
{
    public class List
    {
        public class Query : IRequest<List<ScheduleDto>>
        {
            public int? DoctorId { get; set; } // Opcjonalny filtr
        }

        public class Handler : IRequestHandler<Query, List<ScheduleDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<ScheduleDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.Schedules
                    .Include(s => s.Doctor)
                    .AsQueryable();

                if (request.DoctorId.HasValue)
                {
                    query = query.Where(x => x.DoctorId == request.DoctorId);
                }

                return await query
                    .ProjectTo<ScheduleDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }
        }
    }
}