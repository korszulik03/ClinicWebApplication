namespace Clinic.Domain
{
    public class Specialization
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}