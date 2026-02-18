import { Button, TextField, Box, MenuItem, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import agent from "../../../app/api/agent";
import type { Doctor, DoctorFormValues, Specialization } from "../../../types";

interface Props {
    doctor: Doctor | undefined;
    closeForm: () => void;
    loadDoctors: () => void;
}

export default function DoctorForm({ doctor, closeForm, loadDoctors }: Props) {
    const [formData, setFormData] = useState<DoctorFormValues>({
        firstName: '',
        lastName: '',
        email: '',
        specializationId: ''
    });

    const [specializations, setSpecializations] = useState<Specialization[]>([]);

    useEffect(() => {
        agent.Specializations.list().then(setSpecializations);
    }, []);

    useEffect(() => {
        if (doctor && specializations.length > 0) {
            const spec = specializations.find(s => s.name === doctor.specializationName);
            setFormData({
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                specializationId: spec ? spec.id : ''
            });
        }
    }, [doctor, specializations]);

    function handleSubmit() {
        const doctorToSend = { ...formData, specializationId: Number(formData.specializationId) };
        const isEdit = doctor && doctor.id;

        const action = isEdit
            ? agent.Doctors.update(doctorToSend)
            : agent.Doctors.create(doctorToSend);

        action.then(() => {
            toast.success(isEdit ? "Zaktualizowano dane lekarza" : "Dodano nowego lekarza");
            loadDoctors();
            closeForm();
        }).catch(err => console.error(err));
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    return (
        <form autoComplete="off">
            <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                    <TextField label="Imię" name="firstName" value={formData.firstName} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <TextField label="Nazwisko" name="lastName" value={formData.lastName} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField label="Email" name="email" value={formData.email} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        select
                        label="Specjalizacja"
                        name="specializationId"
                        value={formData.specializationId}
                        onChange={handleInputChange}
                        fullWidth
                    >
                        {specializations.map(spec => (
                            <MenuItem key={spec.id} value={spec.id}>{spec.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{xs: 12}} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={closeForm} color="inherit" startIcon={<CancelIcon />}>Anuluj</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.specializationId}
                        startIcon={<SaveIcon />}
                    >
                        Zapisz
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}