namespace Clinic.Domain
{
    public class Prescription
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<PrescriptionMedication> PrescriptionMedications { get; set; } = new List<PrescriptionMedication>();
    }
}