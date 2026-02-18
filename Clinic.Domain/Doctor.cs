namespace Clinic.Domain
{
    public class Doctor
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; } 

        public int SpecializationId { get; set; }
        public Specialization? Specialization { get; set; } 

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    }
}