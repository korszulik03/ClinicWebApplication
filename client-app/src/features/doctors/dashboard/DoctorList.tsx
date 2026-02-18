import { Grid, Card, CardContent, Typography, CardActions, Button, Avatar, Box } from "@mui/material";
import { Link } from "react-router-dom";
import type { Doctor } from "../../../types";

interface Props {
    doctors: Doctor[];
    selectDoctor: (id: number) => void;
    deleteDoctor: (id: number) => void;
}

// Helper do generowania koloru z tekstu (żeby każdy lekarz miał stały, inny kolor)
function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
            width: 56, height: 56, fontSize: '1.2rem'
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

export default function DoctorList({ doctors, selectDoctor, deleteDoctor }: Props) {
    return (
        <Grid container spacing={2}>
            {doctors.map(doctor => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doctor.id}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar {...stringAvatar(`${doctor.firstName} ${doctor.lastName}`)} />
                            </Box>

                            <Typography variant="h6" component="div" gutterBottom>
                                {doctor.firstName} {doctor.lastName}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="primary" variant="subtitle2">
                                {doctor.specializationName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {doctor.email}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            <Button size="small" component={Link} to={`/doctors/${doctor.id}`}>Szczegóły</Button>
                            <Button size="small" color="secondary" onClick={() => selectDoctor(doctor.id)}>Edytuj</Button>
                            <Button size="small" color="error" onClick={() => deleteDoctor(doctor.id)}>Usuń</Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}