import axios, { AxiosError, type AxiosResponse } from 'axios';
import { toast } from 'react-toastify'; // <--- IMPORT
import type { Doctor, DoctorFormValues, Specialization, User, UserFormValues, Appointment, Schedule, Medication, Prescription, PrescriptionFormValues, Patient } from '../../types';

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

axios.defaults.baseURL = 'http://localhost:5026/api';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

// --- ZMODYFIKOWANY INTERCEPTOR ODPOWIEDZI ---
axios.interceptors.response.use(async response => {
    await sleep(500);
    return response;
}, (error: AxiosError) => {
    // Tutaj łapiemy błędy
    const { data, status } = error.response as AxiosResponse;

    switch (status) {
        case 400:
            if (data.errors) {
                const modalStateErrors = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        const errorMessages = data.errors[key];

                        // ULEPSZENIE: Sprawdzamy czy to tablica i wyświetlamy KAŻDY komunikat osobno
                        if (Array.isArray(errorMessages)) {
                            errorMessages.forEach(msg => toast.error(msg));
                        } else {
                            toast.error(errorMessages);
                        }

                        modalStateErrors.push(errorMessages);
                    }
                }
                throw modalStateErrors.flat();
            } else {
                toast.error(data);
            }
            break;
        case 401:
            toast.error('Nieautoryzowany - zaloguj się ponownie');
            break;
        case 404:
            toast.error('Nie znaleziono zasobu');
            break;
        case 500:
            // To złapie błąd z ExceptionMiddleware ("Lekarz nie pracuje...")
            // data.message pochodzi z Twojego backendu (AppException)
            toast.error(data.message);
            break;
        default:
            toast.error('Coś poszło nie tak');
            break;
    }

    return Promise.reject(error);
})

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// ... reszta pliku bez zmian (requests, Doctors, Account itd.) ...
const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Account = {
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user),
    current: () => requests.get<User>('/account'),
}

const Doctors = {
    list: () => requests.get<Doctor[]>('/doctors'),
    details: (id: number) => requests.get<Doctor>(`/doctors/${id}`),
    create: (doctor: DoctorFormValues) => requests.post<void>('/doctors', doctor),
    update: (doctor: DoctorFormValues) => requests.put<void>(`/doctors/${doctor.id}`, doctor),
    delete: (id: number) => requests.del<void>(`/doctors/${id}`),
}

const Specializations = {
    list: () => requests.get<Specialization[]>('/specializations')
}

const Patients = {
    list: () => requests.get<Patient[]>('/patients'),
    details: (id: string) => requests.get<Patient>(`/patients/${id}`),
    create: (patient: Patient) => requests.post<void>('/patients', patient),
    update: (patient: Patient) => requests.put<void>(`/patients/${patient.id}`, patient),
    delete: (id: number) => requests.del<void>(`/patients/${id}`)
}

const Appointments = {
    list: () => requests.get<Appointment[]>('/appointments'),
    create: (appointment: any) => requests.post<void>('/appointments', appointment),
    update: (appointment: any) => requests.put<void>(`/appointments/${appointment.id}`, appointment),
    delete: (id: number) => requests.del<void>(`/appointments/${id}`)
}

const Medications = {
    list: () => requests.get<Medication[]>('/medications'),
    create: (name: string) => requests.post<void>('/medications', { name }),
    delete: (id: number) => requests.del<void>(`/medications/${id}`)
}

const Prescriptions = {
    list: () => requests.get<Prescription[]>('/prescriptions'),
    create: (prescription: PrescriptionFormValues) => requests.post<void>('/prescriptions', prescription),
    delete: (id: number) => requests.del<void>(`/prescriptions/${id}`)
}

const Schedules = {
    list: (doctorId: number) => requests.get<Schedule[]>(`/schedules?doctorId=${doctorId}`),
    create: (schedule: any) => requests.post<void>('/schedules', schedule),
    delete: (id: number) => requests.del<void>(`/schedules/${id}`)
}

const agent = {
    Account,
    Doctors,
    Specializations,
    Patients,
    Appointments,
    Medications,
    Prescriptions,
    Schedules
}

export default agent;