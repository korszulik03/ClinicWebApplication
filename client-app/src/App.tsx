import { useState, useEffect } from 'react';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importy komponentów
import LoginForm from './features/users/LoginForm';
import DoctorDashboard from './features/doctors/dashboard/DoctorDashboard';
import AppointmentDashboard from './features/appointments/dashboard/AppointmentDashboard';
import DoctorDetails from './features/doctors/dashboard/DoctorDetails';
import PatientDetails from './features/patients/dashboard/PatientDetails';
import PatientDashboard from './features/patients/dashboard/PatientDashboard';
import MedicationDashboard from './features/medications/dashboard/MedicationDashboard';
import HomePage from './features/home/HomePage';
import NavBar from './app/layout/NavBar';
import type { User } from './types';
import agent from './app/api/agent';

function App() {
    const [user, setUser] = useState<User | null>(null);
    // Stan ładowania aplikacji (inicjalizacja)
    const [isAppLoading, setIsAppLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('jwt');

        if (token) {
            // Mamy token, sprawdzamy czy jest ważny u backendu
            agent.Account.current()
                .then(user => {
                    setUser(user);
                })
                .catch((error) => {
                    console.log("Sesja wygasła lub błąd tokena", error);
                    localStorage.removeItem('jwt');
                    setUser(null);
                })
                .finally(() => {
                    // Koniec sprawdzania, puszczamy aplikację dalej
                    setIsAppLoading(false);
                });
        } else {
            // Nie ma tokena, od razu pokazujemy login/home niezalogowany
            setIsAppLoading(false);
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem('jwt');
        setUser(null);
    }

    // EKRAN ŁADOWANIA (Kółeczko) - Wyświetla się przy F5
    if (isAppLoading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: '#f5f5f5'
            }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Wczytywanie przychodni...
                </Typography>
            </Box>
        )
    }

    // LOGIKA PRZEKIEROWAŃ
    // Jeśli nie ma usera, pokazujemy Login (chyba że jesteśmy na Home, to można pokazać Home niezalogowany)
    if (!user) {
        return (
            <>
                <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
                {/* Jeśli chcesz, by niezalogowany widział Login Form od razu: */}
                <LoginForm setUser={setUser} />
            </>
        );
    }

    // APLIKACJA (Zalogowany)
    return (
        <>
            <CssBaseline />
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />

            <NavBar logout={handleLogout} displayName={user.displayName} />

            <Routes>
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/doctors" element={<DoctorDashboard />} />
                <Route path="/doctors/:id" element={<DoctorDetails />} />
                <Route path="/patients" element={<PatientDashboard />} />
                <Route path="/patients/:id" element={<PatientDetails />} />
                <Route path="/appointments" element={<AppointmentDashboard />} />
                <Route path="/medications" element={<MedicationDashboard />} />
                {/* Przekierowanie nieznanych tras na Home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}

export default App