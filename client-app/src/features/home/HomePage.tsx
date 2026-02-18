import { useEffect, useState } from 'react';
import {
    Container, Typography, Paper, Box, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Sprawdź czy to Twój import (v5/v6)
import { Link } from 'react-router-dom';

// Importy Ikon
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircleIcon from '@mui/icons-material/Circle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import agent from '../../app/api/agent';
import type { User, Appointment } from '../../types';

interface Props {
    user: User | null;
}

export default function HomePage({ user }: Props) {
    const [stats, setStats] = useState({
        patientsCount: 0,
        doctorsCount: 0,
        appointmentsCount: 0,
        todaysAppointments: 0
    });

    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [doctorsToday, setDoctorsToday] = useState<string[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        if (user) {
            Promise.all([
                agent.Patients.list(),
                agent.Doctors.list(),
                agent.Appointments.list()
            ]).then(([patients, doctors, appointments]) => {
                const now = new Date();

                const isSameDay = (d1: Date, d2: Date) => {
                    return d1.getFullYear() === d2.getFullYear() &&
                        d1.getMonth() === d2.getMonth() &&
                        d1.getDate() === d2.getDate();
                };

                // 1. Statystyki ogólne
                const todaysAppts = appointments.filter(a => isSameDay(new Date(a.dateTime), now));

                setStats({
                    patientsCount: patients.length,
                    doctorsCount: doctors.length,
                    appointmentsCount: appointments.length,
                    todaysAppointments: todaysAppts.length
                });

                // 2. Najbliższe 10 wizyt (ZMIANA Z 5 NA 10)
                const upcoming = appointments
                    .filter(a => new Date(a.dateTime) > now && a.status !== 'Cancelled')
                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                    .slice(0, 10); // <--- ZMIANA LIMITU

                setUpcomingAppointments(upcoming);

                // 3. Lekarze przyjmujący dzisiaj (na podstawie wizyt)
                const activeDocs = Array.from(new Set(todaysAppts.map(a => a.doctorName)));
                setDoctorsToday(activeDocs);

            }).catch(console.error);
        }

        return () => clearInterval(timer);
    }, [user]);

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'confirmed': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    }

    // Tłumaczenie statusów (opcjonalnie, jeśli chcesz mieć PL na głównej)
    function getStatusLabel(status: string) {
        switch (status.toLowerCase()) {
            case 'scheduled': return 'Zaplanowana';
            case 'confirmed': return 'Potwierdzona';
            case 'completed': return 'Zakończona';
            case 'cancelled': return 'Odwołana';
            default: return status;
        }
    }
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

            {/* 1. HEADER I ZEGAR */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        Dzień dobry, {user.displayName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Oto sytuacja w przychodni na chwilę obecną.
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8eaf6', borderRadius: 3 }}>
                    <AccessTimeIcon color="primary" />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#283593', lineHeight: 1 }}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* 2. MAŁE STATYSTYKI */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #1976d2' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>Wizyty Dziś</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{stats.todaysAppointments}</Typography>
                                <EventNoteIcon sx={{ fontSize: 40, color: '#bbdefb' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>Pacjenci</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{stats.patientsCount}</Typography>
                                <PeopleIcon sx={{ fontSize: 40, color: '#c8e6c9' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #ed6c02' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>Lekarze</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>{stats.doctorsCount}</Typography>
                                <LocalHospitalIcon sx={{ fontSize: 40, color: '#ffe0b2' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #9c27b0' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>Łącznie Wizyt</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>{stats.appointmentsCount}</Typography>
                                <EventNoteIcon sx={{ fontSize: 40, color: '#e1bee7' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 3. GŁÓWNA ZAWARTOŚĆ (DWA OKNA) */}
            <Grid container spacing={3}>

                {/* LEWA KOLUMNA: NAJBLIŻSZE WIZYTY */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 0,
                            borderRadius: 3,
                            height: '500px', // SZTYWNA WYSOKOŚĆ
                            display: 'flex', // FLEXBOX
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* NAGŁÓWEK (STAŁY) */}
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', bgcolor: 'white', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarMonthIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Najbliższe Wizyty
                                </Typography>
                            </Box>
                            <Button component={Link} to="/appointments" endIcon={<ArrowForwardIcon />}>
                                Zobacz wszystkie
                            </Button>
                        </Box>

                        {/* TABELA (SCROLLOWANA) */}
                        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#fafafa', fontWeight: 'bold' }}>Godzina</TableCell>
                                        <TableCell sx={{ bgcolor: '#fafafa', fontWeight: 'bold' }}>Pacjent</TableCell>
                                        <TableCell sx={{ bgcolor: '#fafafa', fontWeight: 'bold' }}>Lekarz</TableCell>
                                        <TableCell sx={{ bgcolor: '#fafafa', fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {upcomingAppointments.map((appt) => (
                                        <TableRow key={appt.id} hover>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                                                {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {new Date(appt.dateTime).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{appt.patientName}</TableCell>
                                            <TableCell>{appt.doctorName}</TableCell>
                                            <TableCell>
                                                <Chip label={getStatusLabel(appt.status)} color={getStatusColor(appt.status) as any} size="small" variant="outlined" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {upcomingAppointments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Brak nadchodzących wizyt w najbliższym czasie.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* PRAWA KOLUMNA: LEKARZE DZIŚ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 0,
                            borderRadius: 3,
                            height: '500px', // TA SAMA SZTYWNA WYSOKOŚĆ
                            display: 'flex', // FLEXBOX
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* NAGŁÓWEK (STAŁY) */}
                        <Box sx={{ p: 3, borderBottom: '1px solid #eee', bgcolor: 'white', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MedicalServicesIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Przyjmują dzisiaj
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Lekarze z zaplanowanymi wizytami
                            </Typography>
                        </Box>

                        {/* LISTA (SCROLLOWANA) */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <List sx={{ p: 0 }}>
                                {doctorsToday.map((doctorName, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}>
                                                {doctorName.split(' ')[0][0]}{doctorName.split(' ')[1][0]}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={doctorName}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CircleIcon sx={{ fontSize: 10, color: 'green' }} />
                                                    <Typography variant="caption">Dostępny w placówce</Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                                {doctorsToday.length === 0 && (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Brak zaplanowanych wizyt na dzisiaj.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Box>

                        {/* STOPKA (STAŁA) */}
                        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                            <Button fullWidth variant="outlined" component={Link} to="/doctors">
                                Grafik Lekarzy
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
}