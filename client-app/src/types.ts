// U¿ytkownik (Auth)
export interface User {
    username: string;
    displayName: string;
    token: string;
}

// Logowanie
export interface UserFormValues {
    email?: string;
    password?: string;
    userName?: string; // Do rejestracji
}

// Specjalizacja
export interface Specialization {
    id: number;
    name: string;
}

// Lekarz (Widok listy - DoctorDto)
export interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    specializationName: string; // Backend wysy³a nazwê, nie ID!
}

// Lekarz (Do zapisu/edycji - Create/Edit Command)
export interface DoctorFormValues {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    specializationId: number | string; // Formularz operuje na ID
}

// Pacjent (PatientDto)
export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pesel: string;
    gender?: string;
    age?: number;
    birthDate?: string;
}

// Wizyta (AppointmentDto)
export interface Appointment {
    id: number;
    dateTime: string;
    status: string;
    notes?: string;
    doctorName: string;
    patientId: number;
    patientName: string;
    prescriptions: Prescription[];
}

// Grafik (ScheduleDto)
export interface Schedule {
    id: number;
    doctorId: number;
    doctorName: string;
    dayOfWeek: number;
    dayName: string;
    startTime: string; // TimeSpan przychodzi jako string "08:00:00"
    endTime: string;
}

// Lek (s³ownik)
export interface Medication {
    id: number;
    name: string;
}

// Element recepty (Lek + Dawkowanie)
export interface PrescriptionItem {
    medicationId: number | string; // string dla formularza select
    medicationName?: string;       // opcjonalne do wyœwietlania
    dosage: string;
}

// Recepta (do wys³ania do API)
export interface PrescriptionFormValues {
    appointmentId: number;
    medications: PrescriptionItem[];
}

// Recepta (do wyœwietlania - to co zwraca API)
export interface Prescription {
    id: number;
    appointmentId: number;
    createdAt: string;
    medications: PrescriptionItem[];
}