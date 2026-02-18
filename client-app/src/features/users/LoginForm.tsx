import { useState } from 'react';
import {
    TextField, Button, Container, Paper, Typography, Box,
    Alert, Avatar, InputAdornment
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import agent from '../../app/api/agent';
import type { User } from '../../types';

interface Props {
    setUser: (user: User) => void;
}

export default function LoginForm({ setUser }: Props) {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        agent.Account.login(values)
            .then(user => {
                // Zapisujemy token (ważne dla F5!)
                localStorage.setItem('jwt', user.token);
                setUser(user);
            })
            .catch((err) => {
                console.log(err);
                setError('Nieprawidłowy email lub hasło');
            })
            .finally(() => setLoading(false));
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)', // Medyczny gradient tła
            py: 4
        }}>
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 4 // Zaokrąglone rogi
                    }}
                >
                    {/* LOGO I TYTUŁ */}
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 64, height: 64, mb: 2 }}>
                        <LocalHospitalIcon sx={{ fontSize: 40 }} />
                    </Avatar>

                    <Typography component="h1" variant="h4" sx={{ fontFamily: 'monospace' ,fontWeight: 'bold', color: '#1565c0', mb: 0.5 }}>
                        Clinic App
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        System zarządzania przychodnią
                    </Typography>

                    {/* BŁĄD */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* FORMULARZ */}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Adres Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={values.email}
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Hasło"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={values.password}
                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem' }}
                            disabled={loading}
                            startIcon={!loading && <LoginIcon />}
                        >
                            {loading ? 'Logowanie...' : 'Zaloguj się'}
                        </Button>

                        <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ mt: 2 }}>
                            © 2026 Clinic Management System
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}