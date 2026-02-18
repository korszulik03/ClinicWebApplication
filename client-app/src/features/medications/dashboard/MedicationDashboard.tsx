import { useEffect, useState } from 'react';
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    TextField, Button, Box, Divider, IconButton, InputAdornment,
    ListItemAvatar, Avatar, Pagination, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MedicationIcon from '@mui/icons-material/Medication';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import agent from '../../../app/api/agent';
import type { Medication } from '../../../types';

export default function MedicationDashboard() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- PAGINACJA NUMERYCZNA ---
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    function loadMedications() {
        agent.Medications.list().then(response => {
            // SORTOWANIE: Od najnowszego (najwyższe ID)
            const sorted = response.sort((a, b) => b.id - a.id);
            setMedications(sorted);
        });
    }

    useEffect(() => {
        loadMedications();
    }, []);

    function handleAdd() {
        if (!newName) return;
        agent.Medications.create(newName).then(() => {
            setNewName('');
            loadMedications();
        });
    }

    function handleDelete(id: number) {
        if (window.confirm("Usunąć lek?")) agent.Medications.delete(id).then(loadMedications);
    }

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const count = Math.ceil(filteredMeds.length / rowsPerPage);
    const visibleMeds = filteredMeds.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>Baza Leków</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    W bazie: {medications.length} poz.
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        label="Szukaj leku..."
                        fullWidth
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <TextField
                            label="Nowa nazwa..."
                            fullWidth
                            size="small"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleAdd}
                            sx={{ minWidth: 100 }}
                        >
                            Dodaj
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 0 }} />

                <List sx={{ bgcolor: 'background.paper' }}>
                    {visibleMeds.map((med) => (
                        <ListItem
                            key={med.id}
                            divider
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(med.id)} color="default">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
                                    <MedicationIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{med.name}</Typography>}
                                secondary={`ID Systemowe: ${med.id}`}
                            />
                        </ListItem>
                    ))}
                    {visibleMeds.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">Nie znaleziono leków.</Typography>
                        </Box>
                    )}
                </List>

                {/* --- PAGINACJA NUMERYCZNA --- */}
                {count > 1 && (
                    <Stack spacing={2} sx={{ p: 2, alignItems: 'center', borderTop: '1px solid #eee' }}>
                        <Pagination
                            count={count}
                            page={page}
                            onChange={handleChangePage}
                            color="error"
                            showFirstButton
                            showLastButton
                        />
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}