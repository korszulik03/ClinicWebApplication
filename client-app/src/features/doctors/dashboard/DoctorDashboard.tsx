import { useEffect, useState } from 'react';
import { Button, Container, Typography, Box, TextField, InputAdornment, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DoctorList from './DoctorList';
import DoctorForm from './DoctorForm';
import agent from '../../../app/api/agent';
import type { Doctor } from '../../../types';

export default function DoctorDashboard() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Stan Modala
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined);

    function loadDoctors() {
        agent.Doctors.list().then(setDoctors);
    }

    useEffect(() => {
        loadDoctors();
    }, []);

    // Otwórz modal do edycji
    function handleSelectDoctor(id: number) {
        const doctor = doctors.find(x => x.id === id);
        setSelectedDoctor(doctor);
        setIsDialogOpen(true);
    }

    // Otwórz modal do tworzenia
    function handleCreateDoctor() {
        setSelectedDoctor(undefined);
        setIsDialogOpen(true);
    }

    function handleDeleteDoctor(id: number) {
        if (window.confirm('Na pewno usunąć?')) {
            agent.Doctors.delete(id).then(() => loadDoctors());
        }
    }

    const filteredDoctors = doctors.filter(doc =>
        doc.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specializationName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Personel Medyczny
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Szukaj lekarza..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateDoctor}
                    >
                        Nowy Lekarz
                    </Button>
                </Box>
            </Box>

            {/* MODAL (DIALOG) */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedDoctor ? `Edycja: ${selectedDoctor.lastName}` : "Nowy Lekarz"}
                    <IconButton onClick={() => setIsDialogOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <DoctorForm
                        doctor={selectedDoctor}
                        closeForm={() => setIsDialogOpen(false)}
                        loadDoctors={loadDoctors}
                    />
                </DialogContent>
            </Dialog>

            {/* LISTA KART */}
            <DoctorList
                doctors={filteredDoctors}
                selectDoctor={handleSelectDoctor}
                deleteDoctor={handleDeleteDoctor}
            />

            {filteredDoctors.length === 0 && (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
                    Nie znaleziono lekarzy.
                </Typography>
            )}
        </Container>
    )
}