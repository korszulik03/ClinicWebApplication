using AutoMapper;
using Clinic.Application.Core;
using Clinic.Application.DTOs;
using Clinic.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Application.Patients
{
    public class Details
    {
        public class Query : IRequest<PatientDto>
        {
            public int Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, PatientDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<PatientDto> Handle(Query request, CancellationToken cancellationToken)
            {
                // 1. Pobieramy obiekt Domenowy
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

                if (patient == null) return null;

                // 2. Mapujemy na DTO (FirstName, LastName, PESEL itp.)
                var patientDto = _mapper.Map<PatientDto>(patient);

                // 3. Uzupełniamy pola wyliczane (Wiek, Płeć)
                if (!string.IsNullOrEmpty(patient.PESEL))
                {
                    patientDto.Gender = PeselUtils.GetGender(patient.PESEL);

                    var birthDate = PeselUtils.GetBirthDate(patient.PESEL);
                    if (birthDate.HasValue)
                    {
                        patientDto.BirthDate = birthDate.Value;

                        // Obliczanie wieku
                        var today = DateTime.Today;
                        var age = today.Year - patientDto.BirthDate.Year;
                        if (patientDto.BirthDate.Date > today.AddYears(-age)) age--;

                        patientDto.Age = age;
                    }
                }

                return patientDto;
            }
        }
    }
}