namespace Clinic.Application.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public DateTime DateTime { get; set; }
        public required string Status { get; set; }
        public string? Notes { get; set; }

        public int DoctorId { get; set; }
        public required string DoctorName { get; set; }
        public int PatientId { get; set; }
        public required string PatientName { get; set; }

        public ICollection<PrescriptionDto> Prescriptions { get; set; } = new List<PrescriptionDto>();
    }
}