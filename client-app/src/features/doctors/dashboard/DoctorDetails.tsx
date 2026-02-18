import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, Box, Grid, Button, Divider,
    List, ListItem, ListItemText, IconButton, TextField, MenuItem, Chip, Avatar, Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import agent from '../../../app/api/agent';
import type { Doctor, Schedule } from '../../../types';

// Helper do kolorów (taki sam jak w Dashboardzie)
function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) { hash = string.charCodeAt(i) + ((hash << 5) - hash); }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

export default function DoctorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    const [newSchedule, setNewSchedule] = useState({
        dayOfWeek: 1, startTime: '08:00', endTime: '16:00'
    });

    const days = [
        { val: 0, label: "Niedziela" }, { val: 1, label: "Poniedziałek" },
        { val: 2, label: "Wtorek" }, { val: 3, label: "Środa" },
        { val: 4, label: "Czwartek" }, { val: 5, label: "Piątek" },
        { val: 6, label: "Sobota" }
    ];

    useEffect(() => {
        if (id) {
            agent.Doctors.details(parseInt(id)).then(setDoctor);
            loadSchedules();
        }
    }, [id]);

    function loadSchedules() {
        if (id) agent.Schedules.list(parseInt(id)).then(setSchedules);
    }

    function handleAddSchedule() {
        if (!doctor) return;
        const scheduleToSend = {
            doctorId: doctor.id,
            dayOfWeek: newSchedule.dayOfWeek,
            startTime: newSchedule.startTime + ":00",
            endTime: newSchedule.endTime + ":00"
        };
        agent.Schedules.create(scheduleToSend).then(loadSchedules).catch(console.error);
    }

    function handleDeleteSchedule(scheduleId: number) {
        agent.Schedules.delete(scheduleId).then(loadSchedules);
    }

    if (!doctor) return <Typography>Ładowanie...</Typography>;

    const avatarColor = stringToColor(`${doctor.firstName} ${doctor.lastName}`);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/doctors')} sx={{ mb: 2 }}>
                Powrót
            </Button>

            <Grid container spacing={4}>
                {/* PROFIL LEKARZA */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={3} sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: avatarColor, width: 100, height: 100, fontSize: '2.5rem' }}>
                                    {doctor.firstName[0]}{doctor.lastName[0]}
                                </Avatar>
                            </Box>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {doctor.firstName} {doctor.lastName}
                            </Typography>
                            <Chip label={doctor.specializationName} color="primary" sx={{ mb: 2 }} />
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary" align="left">
                                <strong>Email:</strong> {doctor.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="left" sx={{ mt: 1 }}>
                                ID: {doctor.id}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* GRAFIK */}
                <Grid size={ {xs: 12, md: 8} }>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AccessTimeIcon color="primary" />
                            <Typography variant="h5">Grafik Pracy</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                            <TextField
                                select label="Dzień" size="small" sx={{ width: 150, bgcolor: 'white' }}
                                value={newSchedule.dayOfWeek}
                                onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(e.target.value) })}
                            >
                                {days.map(d => <MenuItem key={d.val} value={d.val}>{d.label}</MenuItem>)}
                            </TextField>

                            <TextField
                                type="time" label="Od" size="small" sx={{ bgcolor: 'white' }}
                                InputLabelProps={{ shrink: true }}
                                value={newSchedule.startTime}
                                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                            />
                            <Typography>-</Typography>
                            <TextField
                                type="time" label="Do" size="small" sx={{ bgcolor: 'white' }}
                                InputLabelProps={{ shrink: true }}
                                value={newSchedule.endTime}
                                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                            />

                            <Button variant="contained" onClick={handleAddSchedule}>Dodaj</Button>
                        </Box>

                        <List>
                            {schedules.length === 0 && <Typography align="center" color="text.secondary">Brak ustalonych godzin przyjęć.</Typography>}

                            {schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((sch) => (
                                <ListItem
                                    key={sch.id}
                                    secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => handleDeleteSchedule(sch.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                    divider
                                >
                                    <ListItemText
                                        primary={sch.dayName}
                                        secondary={`${sch.startTime.toString().substring(0, 5)} - ${sch.endTime.toString().substring(0, 5)}`}
                                        primaryTypographyProps={{ fontWeight: 500 }}
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