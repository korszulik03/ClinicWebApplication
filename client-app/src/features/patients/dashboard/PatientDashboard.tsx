import { useEffect, useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Box, IconButton, TextField, InputAdornment,
    Avatar, Dialog, DialogContent, DialogTitle, Pagination, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import agent from '../../../app/api/agent';
import type { Patient } from '../../../types';
import PatientForm from './PatientForm';

export default function PatientDashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);

    function loadPatients() {
        agent.Patients.list().then(response => {
            const sorted = response.sort((a, b) => b.id - a.id);
            setPatients(sorted);
        }).catch(console.error);
    }

    useEffect(() => {
        loadPatients();
    }, []);

    function handleCreate() {
        setSelectedPatient(undefined);
        setIsDialogOpen(true);
    }

    function handleEdit(patient: Patient) {
        setSelectedPatient(patient);
        setIsDialogOpen(true);
    }

    function handleDelete(id: number) {
        if (window.confirm('Usunąć pacjenta?')) {
            agent.Patients.delete(id).then(loadPatients);
        }
    }

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- NAPRAWIONE FILTROWANIE ---
    const filteredPatients = patients.filter(p => {
        const search = searchTerm.toLowerCase();
        // Łączymy imię i nazwisko, żeby "Jan Kowalski" znajdowało po wpisaniu spacji
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const reversedName = `${p.lastName} ${p.firstName}`.toLowerCase();

        return fullName.includes(search) ||
            reversedName.includes(search) ||
            p.pesel.includes(search);
    });

    const count = Math.ceil(filteredPatients.length / rowsPerPage);
    const visiblePatients = filteredPatients.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Baza Pacjentów</Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Szukaj (Imię / Nazwisko / PESEL)..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                        sx={{ bgcolor: 'white', minWidth: 250 }}
                    />
                    <Button variant="contained" color="success" startIcon={<PersonAddIcon />} onClick={handleCreate}>
                        Dodaj
                    </Button>
                </Box>
            </Box>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedPatient ? `Edycja: ${selectedPatient.lastName}` : "Nowy Pacjent"}
                    <IconButton onClick={() => setIsDialogOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <PatientForm
                        patient={selectedPatient}
                        closeForm={() => setIsDialogOpen(false)}
                        loadPatients={loadPatients}
                    />
                </DialogContent>
            </Dialog>

            <Paper elevation={2} sx={{ p: 0, overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Pacjent</TableCell>
                                <TableCell>Kontakt</TableCell>
                                <TableCell>PESEL</TableCell>
                                <TableCell align="right">Akcje</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visiblePatients.map((patient) => (
                                <TableRow key={patient.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#2e7d32' }}>{patient.firstName[0]}{patient.lastName[0]}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {patient.firstName} {patient.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">ID: {patient.id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {patient.email && <Typography variant="body2"><strong>Email:</strong> {patient.email}</Typography>}
                                        {patient.phone && <Typography variant="body2"><strong>Telefon:</strong> {patient.phone}</Typography>}
                                        {!patient.email && !patient.phone && <Typography variant="caption" color="text.secondary">Brak kontaktu</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 }}>
                                            {patient.pesel}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="info" component={Link} to={`/patients/${patient.id}`} title="Szczegóły">
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton color="primary" onClick={() => handleEdit(patient)} title="Edytuj">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(patient.id)} title="Usuń">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {visiblePatients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>Brak wyników</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {count > 1 && (
                    <Stack spacing={2} sx={{ p: 2, alignItems: 'center', borderTop: '1px solid #eee' }}>
                        <Pagination
                            count={count}
                            page={page}
                            onChange={handleChangePage}
                            color="success"
                            showFirstButton
                            showLastButton
                            size="large"
                        />
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}