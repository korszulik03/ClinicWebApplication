using AutoMapper;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Patients
{
    public class List
    {
        public class Query : IRequest<List<PatientDto>> { }

        public class Handler : IRequestHandler<Query, List<PatientDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<PatientDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var patients = await _context.Patients
                    .OrderByDescending(x => x.Id)
                    .ToListAsync(cancellationToken);

         
                var dtos = new List<PatientDto>();

                foreach (var p in patients)
                {
                    var dto = _mapper.Map<PatientDto>(p);
                    dtos.Add(dto);
                }

                return dtos;
            }
        }
    }
}