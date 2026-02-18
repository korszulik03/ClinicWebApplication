import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Button, Paper, TextField, Typography, Box, MenuItem, Autocomplete } from "@mui/material";
import Grid from '@mui/material/Grid';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import agent from "../../../app/api/agent";
import type { Doctor, Patient, Appointment } from "../../../types";

interface Props {
    appointment?: Appointment;
    closeForm: () => void;
    loadAppointments: () => void;
    isInline?: boolean;
}

export default function AppointmentForm({ appointment, closeForm, loadAppointments, isInline = false }: Props) {
    const initialState = {
        dateTime: '',
        doctorId: '',
        patientId: '',
        status: 'Scheduled',
        notes: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        if (!appointment) {
            agent.Doctors.list().then(setDoctors);
            agent.Patients.list().then(setPatients);
        }
    }, [appointment]);

    useEffect(() => {
        if (appointment) {
            setFormData({
                dateTime: appointment.dateTime,
                doctorId: '',
                patientId: '',
                status: appointment.status,
                notes: appointment.notes || ''
            });
        }
    }, [appointment]);

    function handleSubmit() {
        const appointmentToSend = {
            id: appointment?.id,
            dateTime: formData.dateTime,
            doctorId: appointment ? 0 : parseInt(formData.doctorId),
            patientId: appointment ? 0 : parseInt(formData.patientId),
            status: formData.status,
            notes: formData.notes
        };

        const action = appointment
            ? agent.Appointments.update(appointmentToSend)
            : agent.Appointments.create(appointmentToSend);

        action
            .then(() => {
                toast.success(appointment ? "Zaktualizowano wizytę!" : "Umówiono wizytę!");
                loadAppointments();
                closeForm();
            })
            .catch(error => console.error(error));
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    const Content = (
        <Box sx={{ p: isInline ? 2 : 0 }}>
            <form autoComplete="off">
                <Grid container spacing={2}>
                    {!appointment ? (
                        <>
                            {/* LEKARZ (Select jest OK dla małej liczby) */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select label="Lekarz" name="doctorId"
                                    value={formData.doctorId} onChange={handleInputChange} fullWidth size="small"
                                >
                                    {doctors.map(doc => (
                                        <MenuItem key={doc.id} value={doc.id}>{doc.firstName} {doc.lastName}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* PACJENT - ZMIANA NA AUTOCOMPLETE (WYSZUKIWARKA) */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Autocomplete
                                    disablePortal
                                    options={patients}
                                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.pesel})`}
                                    // Obsługa wyboru
                                    onChange={(event, newValue) => {
                                        setFormData({ ...formData, patientId: newValue ? newValue.id.toString() : '' });
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Wyszukaj Pacjenta" size="small" fullWidth />
                                    )}
                                />
                            </Grid>
                        </>
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                                Edycja terminu dla: <strong>{appointment.doctorName}</strong> i pacjenta <strong>{appointment.patientName}</strong>
                            </Typography>
                        </Grid>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            type="datetime-local" label="Data" name="dateTime"
                            value={formData.dateTime} onChange={handleInputChange}
                            fullWidth size="small" InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select label="Status" name="status"
                            value={formData.status} onChange={handleInputChange} fullWidth size="small"
                        >
                            <MenuItem value="Scheduled">Zaplanowana</MenuItem>
                            <MenuItem value="Confirmed">Potwierdzona</MenuItem>
                            <MenuItem value="Completed">Zakończona</MenuItem>
                            <MenuItem value="Cancelled">Odwołana</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Notatki" name="notes"
                            value={formData.notes} onChange={handleInputChange}
                            multiline rows={isInline ? 2 : 3} fullWidth size="small"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            onClick={closeForm}
                            color="inherit"
                            startIcon={<CancelIcon />}
                            size="small"
                        >
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            size="small"
                        >
                            Zapisz
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );

    return isInline ? (
        <Paper variant="outlined" sx={{ bgcolor: '#f0f7ff', border: '1px solid #90caf9' }}>
            {Content}
        </Paper>
    ) : (
        <Box>
            {Content}
        </Box>
    );
}