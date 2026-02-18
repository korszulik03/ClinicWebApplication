using AutoMapper;
using Clinic.Infrastructure;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Doctors
{
    public class Edit
    {
        public class Command : IRequest
        {
            public int Id { get; set; } // ID lekarza, którego edytujemy
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public int SpecializationId { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.FirstName).NotEmpty();
                RuleFor(x => x.LastName).NotEmpty();
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
            }
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
                var doctor = await _context.Doctors.FindAsync(request.Id);

                if (doctor == null) return;

                // Ręczna aktualizacja pól (można też użyć AutoMappera)
                doctor.FirstName = request.FirstName;
                doctor.LastName = request.LastName;
                doctor.Email = request.Email;
                doctor.SpecializationId = request.SpecializationId;

                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}