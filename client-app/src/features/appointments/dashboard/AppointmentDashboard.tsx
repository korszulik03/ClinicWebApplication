import { useEffect, useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, Box,
    Collapse, IconButton, List, ListItem, ListItemText, Tabs, Tab,
    Alert, AlertTitle, Dialog, DialogContent, DialogTitle, Divider,
    ListItemAvatar, Avatar, Pagination, Stack
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NoteIcon from '@mui/icons-material/Note';
import CloseIcon from '@mui/icons-material/Close';
import MedicationIcon from '@mui/icons-material/Medication';

import agent from '../../../app/api/agent';
import type { Appointment } from '../../../types';
import AppointmentForm from './AppointmentForm';
import PrescriptionForm from './PrescriptionForm';

function getStatusLabel(status: string) {
    switch (status.toLowerCase()) {
        case 'scheduled': return 'Zaplanowana';
        case 'confirmed': return 'Potwierdzona';
        case 'completed': return 'Zakończona';
        case 'cancelled': return 'Odwołana';
        default: return status;
    }
}

function Row({ appt, onDelete, loadAppointments, onPrescriptionClick, onDeletePrescription }: any) {
    const [mode, setMode] = useState<'closed' | 'details' | 'edit'>('closed');
    const dateObj = new Date(appt.dateTime);

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'confirmed': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    }

    function handleEditClick() {
        if (mode === 'edit') setMode('closed');
        else setMode('edit');
    }

    function handleDetailsClick() {
        if (mode === 'details') setMode('closed');
        else setMode('details');
    }

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: mode !== 'closed' ? '#f5f5f5' : 'inherit' }}>
                <TableCell width={50}>
                    <IconButton aria-label="expand row" size="small" onClick={handleDetailsClick}>
                        {mode === 'details' ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                    {dateObj.toLocaleDateString()}
                </TableCell>
                <TableCell>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell>{appt.doctorName}</TableCell>
                <TableCell>{appt.patientName}</TableCell>
                <TableCell>
                    <Chip
                        label={getStatusLabel(appt.status)}
                        color={getStatusColor(appt.status) as any}
                        size="small"
                        variant="outlined"
                    />
                </TableCell>
                <TableCell align="right" sx={{ minWidth: 180 }}>
                    <Button
                        variant="contained" size="small" color="success"
                        startIcon={<MedicalServicesIcon />}
                        onClick={() => onPrescriptionClick(appt)}
                        sx={{ mr: 1, textTransform: 'none' }}
                    >
                        Recepta
                    </Button>
                    <IconButton color="primary" size="small" onClick={handleEditClick} sx={{ bgcolor: mode === 'edit' ? '#e3f2fd' : 'transparent' }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => onDelete(appt.id)}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={mode !== 'closed'} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            {mode === 'details' && (
                                <>
                                    {appt.notes && (
                                        <Alert severity="info" icon={<NoteIcon />} sx={{ mb: 2 }}>
                                            <AlertTitle>Notatki</AlertTitle>
                                            {appt.notes}
                                        </Alert>
                                    )}

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                        <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                                            Recepty:
                                        </Typography>
                                        {appt.prescriptions && appt.prescriptions.length > 0 ? (
                                            appt.prescriptions.map((presc: any) => (
                                                <Paper key={presc.id} elevation={0} sx={{ p: 1, mb: 1, bgcolor: '#fafafa', border: '1px solid #eee' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <List dense disablePadding>
                                                            {presc.medications.map((med: any, idx: number) => (
                                                                <ListItem key={idx} sx={{ py: 0 }}>
                                                                    <ListItemAvatar sx={{ minWidth: 40 }}>
                                                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#e3f2fd' }}>
                                                                            <MedicationIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                                                        </Avatar>
                                                                    </ListItemAvatar>
                                                                    <ListItemText
                                                                        primary={<span style={{ fontWeight: 600 }}>{med.medicationName}</span>}
                                                                        secondary={`Dawkowanie: ${med.dosage}`}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                        <IconButton size="small" color="error" onClick={() => onDeletePrescription(presc.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Paper>
                                            ))
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">Brak recept.</Typography>
                                        )}
                                    </Paper>
                                </>
                            )}
                            {mode === 'edit' && (
                                <AppointmentForm
                                    appointment={appt}
                                    isInline={true}
                                    closeForm={() => setMode('closed')}
                                    loadAppointments={loadAppointments}
                                />
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function AppointmentDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [prescriptionAppt, setPrescriptionAppt] = useState<Appointment | null>(null);
    const [tabValue, setTabValue] = useState('all');

    // --- PAGINACJA NUMERYCZNA ---
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    function loadAppointments() {
        agent.Appointments.list()
            .then(response => {
                const sorted = response.sort((a, b) =>
                    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
                );
                setAppointments(sorted);
            })
            .catch(console.error);
    }

    useEffect(() => {
        loadAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appt => {
        if (tabValue === 'all') return true;
        if (tabValue === 'active') return ['Scheduled', 'Confirmed'].includes(appt.status);
        if (tabValue === 'completed') return appt.status === 'Completed';
        if (tabValue === 'cancelled') return appt.status === 'Cancelled';
        return true;
    });

    const count = Math.ceil(filteredAppointments.length / rowsPerPage);
    const visibleAppointments = filteredAppointments.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function handleDeletePrescription(id: number) {
        if (window.confirm("Usunąć receptę?")) agent.Prescriptions.delete(id).then(loadAppointments);
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>Terminarz</Typography>
                <Button variant="contained" startIcon={<EventAvailableIcon />} onClick={() => setIsCreateDialogOpen(true)}>
                    Umów Wizytę
                </Button>
            </Box>

            <Paper sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, val) => { setTabValue(val); setPage(1); }} indicatorColor="primary" textColor="primary" centered>
                    <Tab label="Wszystkie" value="all" />
                    <Tab label="Nadchodzące" value="active" />
                    <Tab label="Zakończone" value="completed" />
                    <Tab label="Odwołane" value="cancelled" />
                </Tabs>
            </Paper>

            <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                    Nowa Wizyta
                    <IconButton onClick={() => setIsCreateDialogOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ mt: 1 }}>
                        <AppointmentForm
                            closeForm={() => setIsCreateDialogOpen(false)}
                            loadAppointments={loadAppointments}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={!!prescriptionAppt} onClose={() => setPrescriptionAppt(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e8f5e9' }}>
                    <Box>
                        Nowa Recepta
                        <Typography variant="caption" display="block" color="text.secondary">
                            Pacjent: <strong>{prescriptionAppt?.patientName}</strong> | Lekarz: <strong>{prescriptionAppt?.doctorName}</strong>
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setPrescriptionAppt(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    {prescriptionAppt && (
                        <PrescriptionForm
                            appointmentId={prescriptionAppt.id}
                            closeForm={() => { setPrescriptionAppt(null); loadAppointments(); }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Paper elevation={2}>
                <TableContainer>
                    <Table aria-label="collapsible table">
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell />
                                <TableCell>Data</TableCell>
                                <TableCell>Godzina</TableCell>
                                <TableCell>Lekarz</TableCell>
                                <TableCell>Pacjent</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Akcje</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleAppointments.map((appt) => (
                                <Row
                                    key={appt.id}
                                    appt={appt}
                                    loadAppointments={loadAppointments}
                                    onDelete={(id: number) => { if (window.confirm("Odwołać?")) agent.Appointments.delete(id).then(loadAppointments); }}
                                    onPrescriptionClick={(appt: Appointment) => setPrescriptionAppt(appt)}
                                    onDeletePrescription={handleDeletePrescription}
                                />
                            ))}
                            {visibleAppointments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>Brak wyników</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* --- PAGINACJA --- */}
                {count > 1 && (
                    <Stack spacing={2} sx={{ p: 2, alignItems: 'center', borderTop: '1px solid #eee' }}>
                        <Pagination
                            count={count}
                            page={page}
                            onChange={handleChangePage}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}