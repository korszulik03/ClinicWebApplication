namespace Clinic.Application.DTOs
{
    public class ScheduleDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } // Imię i nazwisko lekarza

        public int DayOfWeek { get; set; } // 0=Niedziela, 1=Poniedziałek, ...
        public string DayName { get; set; } // np. "Poniedziałek"

        // TimeSpan w JSONie wygląda np. "08:00:00"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}