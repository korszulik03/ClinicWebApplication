import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, Button, Divider, List, ListItem,
    ListItemText, Chip, Avatar, Box, Card, CardContent
} from '@mui/material';
import Grid from '@mui/material/Grid';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import CakeIcon from '@mui/icons-material/Cake';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';

import agent from '../../../app/api/agent';
import type { Patient, Appointment } from '../../../types';

export default function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        if (id) {
            // 1. Pobierz dane pacjenta
            agent.Patients.details(id).then(setPatient);

            // 2. Pobierz wszystkie wizyty i przefiltruj TYLKO dla tego pacjenta
            agent.Appointments.list().then(allAppts => {
                const patientAppts = allAppts.filter(a => a.patientId === Number(id));
                // Sortuj od najnowszych
                patientAppts.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
                setAppointments(patientAppts);
            });
        }
    }, [id]);

    if (!patient) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Ładowanie danych pacjenta...</Typography>;

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'confirmed': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    }

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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients')} sx={{ mb: 2 }}>
                Powrót do listy
            </Button>

            <Grid container spacing={3}>
                {/* 1. KARTA PACJENTA */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar sx={{
                                    bgcolor: patient.gender === 'Kobieta' ? '#f06292' : '#1976d2',
                                    width: 100, height: 100, fontSize: '2.5rem'
                                }}>
                                    {patient.firstName[0]}{patient.lastName[0]}
                                </Avatar>
                            </Box>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {patient.firstName} {patient.lastName}
                            </Typography>
                            <Chip
                                icon={patient.gender === 'Kobieta' ? <FemaleIcon /> : <MaleIcon />}
                                label={patient.gender || "Płeć nieznana"}
                                color={patient.gender === 'Kobieta' ? 'secondary' : 'primary'}
                                variant="outlined"
                                sx={{ mb: 3 }}
                            />

                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FingerprintIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">PESEL</Typography>
                                        <Typography variant="body1" fontWeight="bold">{patient.pesel}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CakeIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Wiek / Data urodzenia</Typography>
                                        <Typography variant="body1">
                                            {patient.age ? `${patient.age} lat` : '-'}
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                ({patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Brak daty'})
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EmailIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{patient.email || "Brak"}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LocalPhoneIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Telefon</Typography>
                                        <Typography variant="body1">{patient.phone || "Brak"}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 2. HISTORIA WIZYT */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', maxHeight: '600px', overflow: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <EventIcon color="primary" fontSize="large" />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Historia Wizyt</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <List>
                            {appointments.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">Brak wizyt w historii tego pacjenta.</Typography>
                                </Box>
                            )}

                            {appointments.map(appt => (
                                <ListItem key={appt.id} divider sx={{ px: 1 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {new Date(appt.dateTime).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    | {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography component="span" variant="body2" color="text.primary" display="block">
                                                    Lekarz: <strong>{appt.doctorName}</strong>
                                                </Typography>
                                                {appt.notes && (
                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                                        "{appt.notes}"
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <Chip
                                        label={getStatusLabel(appt.status)}
                                        size="small"
                                        color={getStatusColor(appt.status) as any}
                                        variant="outlined"
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}