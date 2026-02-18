using AutoMapper;
using Clinic.Application.DTOs;
using Clinic.Domain;

namespace Clinic.Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // Mapowanie Lekarz -> DoctorDto
            CreateMap<Doctor, DoctorDto>()
                .ForMember(d => d.SpecializationName, o => o.MapFrom(s => s.Specialization.Name));

            // Mapowanie Pacjent -> PatientDto
            CreateMap<Patient, PatientDto>();

            // Mapowanie Wizyta -> AppointmentDto
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(d => d.DoctorName, o => o.MapFrom(s => $"{s.Doctor.FirstName} {s.Doctor.LastName}"))
                .ForMember(d => d.PatientName, o => o.MapFrom(s => $"{s.Patient.FirstName} {s.Patient.LastName}"))
                // PatientId i DoctorId mapują się same, bo nazwy są identyczne
                .ForMember(d => d.PatientId, o => o.MapFrom(s => s.PatientId));

            CreateMap<Medication, MedicationDto>();

            // Mapowanie: Tabela łącząca -> DTO (pobieramy nazwę leku z obiektu Medication)
            CreateMap<PrescriptionMedication, PrescriptionMedicationDto>()
                .ForMember(d => d.MedicationName, o => o.MapFrom(s => s.Medication.Name));

            // Mapowanie: Recepta -> DTO (mapujemy listę PrescriptionMedications)
            CreateMap<Prescription, PrescriptionDto>()
                .ForMember(d => d.Medications, o => o.MapFrom(s => s.PrescriptionMedications));

            // Mapowanie: Schedule -> ScheduleDto
            CreateMap<Schedule, ScheduleDto>()
                .ForMember(d => d.DoctorName, o => o.MapFrom(s => s.Doctor.FirstName + " " + s.Doctor.LastName))
                .ForMember(d => d.DayName, o => o.MapFrom(s =>
                    System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetDayName((DayOfWeek)s.DayOfWeek)));

        }
    }
}