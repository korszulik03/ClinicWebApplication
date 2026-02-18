import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router-dom';

interface Props {
    logout: () => void;
    displayName: string;
}

export default function NavBar({ logout, displayName }: Props) {
    return (
        <AppBar position="sticky" sx={{ bgcolor: '#1976d2' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* LOGO */}
                    <LocalHospitalIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: 30 }} />
                    <Typography
                        variant="h6"
                        component={NavLink} to="/"
                        sx={{
                            mr: 4,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.2rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        CLINIC APP
                    </Typography>

                    {/* MENU LINKS */}
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                        {['Lekarze', 'Pacjenci', 'Wizyty', 'Leki'].map((text) => {
                            // Mapowanie polskich nazw na ścieżki
                            const path = text === 'Lekarze' ? '/doctors' :
                                text === 'Pacjenci' ? '/patients' :
                                    text === 'Wizyty' ? '/appointments' : '/medications';
                            return (
                                <Button
                                    key={text}
                                    component={NavLink}
                                    to={path}
                                    sx={{
                                        my: 2, color: 'white', display: 'block', px: 2,
                                        '&.active': { bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }
                                    }}
                                >
                                    {text}
                                </Button>
                            )
                        })}
                    </Box>

                    {/* USER PROFILE */}
                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: '#1565c0', width: 32, height: 32, fontSize: 14 }}>
                                {displayName ? displayName[0].toUpperCase() : 'U'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {displayName}
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            startIcon={<LogoutIcon />}
                            onClick={logout}
                            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                        >
                            Wyloguj
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}