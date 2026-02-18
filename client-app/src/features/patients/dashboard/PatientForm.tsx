import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Button, TextField, Box, Alert, AlertTitle } from "@mui/material";
import Grid from '@mui/material/Grid';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import agent from "../../../app/api/agent";
import type { Patient } from "../../../types";

interface Props {
    patient: Patient | undefined;
    closeForm: () => void;
    loadPatients: () => void;
}

export default function PatientForm({ patient, closeForm, loadPatients }: Props) {
    const initialState = {
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pesel: ''
    };

    const [formData, setFormData] = useState<Patient>(initialState);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (patient) setFormData(patient);
        else setFormData(initialState);
        setErrors([]);
        setSubmitted(false);
    }, [patient]);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        if (errors.length > 0) setErrors([]);
    }

    // --- ALGORYTM WALIDACJI PESEL (Frontend) ---
    function isValidPeselChecksum(pesel: string) {
        if (!/^\d{11}$/.test(pesel)) return false;

        const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
        let sum = 0;

        for (let i = 0; i < 10; i++) {
            sum += parseInt(pesel[i]) * weights[i];
        }

        const controlDigit = (10 - (sum % 10)) % 10;
        const lastDigit = parseInt(pesel[10]);

        return controlDigit === lastDigit;
    }

    // --- WALIDACJA EMAIL ---
    function isValidEmail(email: string) {
        // Prosty regex: coś@coś.coś
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateForm(): boolean {
        const newErrors = [];

        // Pola wymagane
        if (!formData.firstName.trim()) newErrors.push("Imię jest wymagane.");
        if (!formData.lastName.trim()) newErrors.push("Nazwisko jest wymagane.");

        // Walidacja PESEL
        if (!formData.pesel.trim()) {
            newErrors.push("PESEL jest wymagany.");
        } else if (!/^\d{11}$/.test(formData.pesel)) {
            newErrors.push("PESEL musi składać się z 11 cyfr.");
        } else if (!isValidPeselChecksum(formData.pesel)) {
            newErrors.push("Nieprawidłowy numer PESEL (błędna suma kontrolna).");
        }

        // Walidacja Email (tylko jeśli podany)
        if (formData.email.trim() && !isValidEmail(formData.email)) {
            newErrors.push("Niepoprawny format adresu email (np. jan@example.com).");
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    }

    function handleSubmit() {
        setSubmitted(true);

        // Najpierw sprawdzamy lokalnie
        if (!validateForm()) return;

        setLoading(true);
        setErrors([]);

        const action = patient
            ? agent.Patients.update(formData)
            : agent.Patients.create({ ...formData, id: 0 });

        action.then(() => {
            toast.success(patient ? "Dane zaktualizowane" : "Pacjent dodany");
            loadPatients();
            closeForm();
        })
            .catch(error => {
                console.log("Błąd API:", error);
                if (error.response && error.response.data) {
                    const data = error.response.data;
                    if (data.errors) {
                        if (Array.isArray(data.errors)) setErrors(data.errors);
                        else {
                            const flatErrors = Object.values(data.errors).flat() as string[];
                            setErrors(flatErrors);
                        }
                    } else {
                        setErrors(["Wystąpił błąd zapisu."]);
                    }
                } else {
                    setErrors(["Błąd połączenia z serwerem."]);
                }
            })
            .finally(() => setLoading(false));
    }

    // Helper: czy pokazać czerwoną ramkę w polu
    const isError = (fieldVal: string, fieldName: string) => {
        // Jeśli formularz był wysłany I pole jest puste (dla wymaganych)
        if (submitted && !fieldVal.trim() && ['firstName', 'lastName', 'pesel'].includes(fieldName)) return true;
        // LUB jeśli w liście błędów jest błąd dotyczący tego pola
        if (errors.some(e => e.toLowerCase().includes(fieldName.toLowerCase()))) return true;
        if (fieldName === 'pesel' && errors.some(e => e.includes("PESEL"))) return true;
        if (fieldName === 'email' && errors.some(e => e.includes("email"))) return true;

        return false;
    };

    return (
        <Box>
            {errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Błędy w formularzu</AlertTitle>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            <form autoComplete="off">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            label="Imię" name="firstName"
                            value={formData.firstName} onChange={handleInputChange}
                            fullWidth required
                            error={isError(formData.firstName, 'firstName')}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            label="Nazwisko" name="lastName"
                            value={formData.lastName} onChange={handleInputChange}
                            fullWidth required
                            error={isError(formData.lastName, 'lastName')}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="PESEL" name="pesel"
                            value={formData.pesel} onChange={handleInputChange}
                            fullWidth required
                            error={isError(formData.pesel, 'pesel')}
                            helperText="11 cyfr"
                            inputProps={{ maxLength: 11 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Email" name="email"
                            value={formData.email} onChange={handleInputChange}
                            fullWidth
                            placeholder="np. jan@domena.pl (opcjonalnie)"
                            error={isError(formData.email, 'email')}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Telefon" name="phone"
                            value={formData.phone} onChange={handleInputChange}
                            fullWidth
                            placeholder="Opcjonalnie"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button onClick={closeForm} color="inherit" startIcon={<CancelIcon />} disabled={loading}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? "Zapisywanie..." : "Zapisz"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    )
}