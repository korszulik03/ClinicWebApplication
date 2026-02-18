using AutoMapper;
using AutoMapper.QueryableExtensions;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Clinic.Application.Appointments
{
    public class List
    {
        public class Query : IRequest<List<AppointmentDto>> { }

        public class Handler : IRequestHandler<Query, List<AppointmentDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<AppointmentDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Appointments
                    .OrderByDescending(x => x.DateTime)
                    .ProjectTo<AppointmentDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);
            }
        }
    }
}