namespace Clinic.Domain
{
    public class Appointment
    {
        public int Id { get; set; }
        public DateTime DateTime { get; set; }
        public required string Status { get; set; }
        public string? Notes { get; set; } 

        public int DoctorId { get; set; }
        public Doctor? Doctor { get; set; } 

        public int PatientId { get; set; }
        public Patient? Patient { get; set; }

        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}