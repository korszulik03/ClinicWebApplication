using FluentValidation;
using MediatR;

namespace Clinic.Application.Core
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            // Jeśli nie ma walidatorów dla tej komendy, idź dalej
            if (!_validators.Any())
            {
                return await next();
            }

            var context = new ValidationContext<TRequest>(request);

            // Uruchom wszystkie walidatory ASYNCHRONICZNIE
            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, cancellationToken))
            );

            var failures = validationResults
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            // Jeśli są błędy, rzuć wyjątek (Middleware go złapie i zwróci 400)
            if (failures.Count != 0)
            {
                throw new ValidationException(failures);
            }

            // Jeśli czysto, idź do Handlera
            return await next();
        }
    }
}