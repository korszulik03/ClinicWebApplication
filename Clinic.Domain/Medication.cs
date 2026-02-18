namespace Clinic.Domain
{
    public class Medication
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public ICollection<PrescriptionMedication> PrescriptionMedications { get; set; } = new List<PrescriptionMedication>();
    }
}