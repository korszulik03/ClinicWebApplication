namespace Clinic.Application.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Lista leków na tej recepcie
        public List<PrescriptionMedicationDto> Medications { get; set; } = new List<PrescriptionMedicationDto>();
    }

    public class PrescriptionMedicationDto
    {
        public int MedicationId { get; set; }
        public string MedicationName { get; set; } // Nazwa leku (np. Apap)
        public string Dosage { get; set; }         // Dawkowanie (np. 2x dziennie)
    }
}