import { useState, useEffect } from "react";
import { Button, TextField, Box, IconButton, Divider, Typography, Autocomplete } from "@mui/material";
import Grid from '@mui/material/Grid';

import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import agent from "../../../app/api/agent";
import type { Medication, PrescriptionItem } from "../../../types";

interface Props {
    appointmentId: number;
    closeForm: () => void;
}

export default function PrescriptionForm({ appointmentId, closeForm }: Props) {
    const [availableMedications, setAvailableMedications] = useState<Medication[]>([]);

    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
        { medicationId: '', dosage: '' }
    ]);

    useEffect(() => {
        agent.Medications.list().then(setAvailableMedications);
    }, []);

    // Helper do aktualizacji pola
    function updateField(index: number, field: keyof PrescriptionItem, value: any) {
        const newItems = [...prescriptionItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPrescriptionItems(newItems);
    }

    function handleAddItem() {
        setPrescriptionItems([...prescriptionItems, { medicationId: '', dosage: '' }]);
    }

    function handleRemoveItem(index: number) {
        const newItems = prescriptionItems.filter((_, i) => i !== index);
        setPrescriptionItems(newItems);
    }

    function handleSubmit() {
        const validItems = prescriptionItems.filter(x => x.medicationId && x.dosage);

        if (validItems.length === 0) {
            toast.error("Dodaj przynajmniej jeden lek!");
            return;
        }

        const prescriptionToSend = {
            appointmentId: appointmentId,
            medications: validItems
        };

        agent.Prescriptions.create(prescriptionToSend)
            .then(() => {
                toast.success("Recepta wystawiona pomyślnie!");
                closeForm();
            })
            .catch(err => console.error(err));
    }

    return (
        <Box>
            <form autoComplete="off">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Lista Leków */}
                    {prescriptionItems.map((item, index) => (
                        <Box key={index} sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #eee' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 1 }}>
                                    <Typography variant="body2" color="text.secondary" align="center">{index + 1}.</Typography>
                                </Grid>

                                {/* WYSZUKIWARKA LEKÓW (Autocomplete) */}
                                <Grid size={{ xs: 6 }}>
                                    <Autocomplete
                                        disablePortal
                                        options={availableMedications}
                                        getOptionLabel={(option) => option.name}
                                        // Znajdź aktualnie wybrany obiekt leku (do wyświetlenia)
                                        value={availableMedications.find(m => m.id.toString() === item.medicationId.toString()) || null}
                                        onChange={(event, newValue) => {
                                            updateField(index, 'medicationId', newValue ? newValue.id : '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Wyszukaj Lek" size="small" fullWidth />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        label="Dawkowanie" fullWidth size="small"
                                        placeholder="np. 1x1"
                                        value={item.dosage}
                                        onChange={(e) => updateField(index, 'dosage', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 1 }}>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={prescriptionItems.length === 1}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}

                    <Button startIcon={<AddCircleIcon />} onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
                        Dodaj kolejny lek
                    </Button>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={closeForm} color="inherit" startIcon={<CancelIcon />}>
                            Anuluj
                        </Button>
                        <Button onClick={handleSubmit} variant="contained" color="success" startIcon={<SaveIcon />}>
                            Wystaw Receptę
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    )
}