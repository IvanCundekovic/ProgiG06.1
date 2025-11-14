"use client";

import {ChangeEvent, FormEvent, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import type {LiveWorkshop, WorkshopRequirement} from "@/app/types/quiz";
import {useLessonFeedback} from "@/app/functions/useLessonFeedback";
import {useLiveWorkshops} from "@/app/functions/useLiveWorkshops";
import {useSession} from "next-auth/react";

type WorkshopFormState = {
    title: string;
    description: string;
    scheduledAt: string;
    durationMinutes: string;
    capacity: string;
    meetingUrl: string;
    requirements: WorkshopRequirement[];
};

const defaultFormState: WorkshopFormState = {
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: "60",
    capacity: "20",
    meetingUrl: "",
    requirements: []
};

const requirementTemplates: WorkshopRequirement[] = [
    {
        id: "req-lesson-3",
        type: "completedLesson",
        lessonId: "lesson-3",
        description: "Završena lekcija: Pho juha u 30 minuta"
    },
    {
        id: "req-lesson-5",
        type: "completedLesson",
        lessonId: "lesson-5",
        description: "Završena lekcija: Burger od leće"
    },
    {
        id: "req-course-1",
        type: "completedCourse",
        courseId: "course-1",
        description: "Završeni tečaj: Osnove mediteranske kuhinje"
    },
    {
        id: "req-custom-1",
        type: "custom",
        description: "Vlastiti kuhinjski prostor i stabilna internetska veza"
    }
];

const isPastDate = (isoDate: string) => new Date(isoDate).getTime() < Date.now();

export default function LiveWorkshops() {
    const {data: session} = useSession();
    const {
        workshops,
        loading: workshopsLoading,
        error: workshopsError,
        createWorkshop,
        updateWorkshop,
        updateWorkshopStatus,
        registerForWorkshop,
        syncCalendar,
        getRegistrationsForWorkshop,
        getUserRegistration,
        clearNotifications
    } = useLiveWorkshops();

    const {markLessonStarted} = useLessonFeedback();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState<WorkshopFormState>(defaultFormState);
    const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
    const [selectedWorkshop, setSelectedWorkshop] = useState<LiveWorkshop | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showSimulationMessage, setShowSimulationMessage] = useState<string | null>(null);

    const sortedWorkshops = useMemo(() => {
        return [...workshops].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [workshops]);

    const upcomingWorkshops = sortedWorkshops.filter(workshop => workshop.status === "upcoming");
    const inProgressWorkshops = sortedWorkshops.filter(workshop => workshop.status === "in_progress");
    const pastWorkshops = sortedWorkshops.filter(workshop => workshop.status === "completed" || isPastDate(workshop.scheduledAt));

    const openDialogForCreate = () => {
        setEditingWorkshopId(null);
        setFormState({
            ...defaultFormState,
            meetingUrl: "https://meet.mock/kuhaona-workshop"
        });
        setDialogOpen(true);
    };

    const openDialogForEdit = (workshop: LiveWorkshop) => {
        setEditingWorkshopId(workshop.id);
        setFormState({
            title: workshop.title,
            description: workshop.description,
            scheduledAt: workshop.scheduledAt,
            durationMinutes: workshop.durationMinutes.toString(),
            capacity: workshop.capacity.toString(),
            meetingUrl: workshop.meetingUrl,
            requirements: workshop.requirements
        });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setFormState(defaultFormState);
        setEditingWorkshopId(null);
    };

    const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleRequirement = (requirement: WorkshopRequirement) => {
        setFormState(prev => {
            const exists = prev.requirements.some(item => item.id === requirement.id);
            return {
                ...prev,
                requirements: exists
                    ? prev.requirements.filter(item => item.id !== requirement.id)
                    : [...prev.requirements, requirement]
            };
        });
    };

    const handleWorkshopSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formState.title.trim() || !formState.scheduledAt) {
            setErrorMessage("Naziv i termin radionice su obavezni.");
            return;
        }

        if (Number.isNaN(Number(formState.durationMinutes)) || Number(formState.durationMinutes) <= 0) {
            setErrorMessage("Trajanje mora biti veće od 0 minuta.");
            return;
        }

        if (Number.isNaN(Number(formState.capacity)) || Number(formState.capacity) <= 0) {
            setErrorMessage("Kapacitet mora biti barem 1 polaznik.");
            return;
        }

        setErrorMessage(null);

        try {
            if (editingWorkshopId) {
                await updateWorkshop({
                    id: editingWorkshopId,
                    title: formState.title.trim(),
                    description: formState.description.trim(),
                    scheduledAt: formState.scheduledAt,
                    durationMinutes: Number(formState.durationMinutes),
                    capacity: Number(formState.capacity),
                    meetingUrl: formState.meetingUrl.trim(),
                    requirements: formState.requirements
                });
                setSuccessMessage("Radionica je uspješno ažurirana.");
            } else {
                const created = await createWorkshop({
                    title: formState.title.trim(),
                    description: formState.description.trim(),
                    scheduledAt: formState.scheduledAt,
                    durationMinutes: Number(formState.durationMinutes),
                    capacity: Number(formState.capacity),
                    meetingUrl: formState.meetingUrl.trim(),
                    requirements: formState.requirements
                });
                setSuccessMessage(`Radionica "${created.title}" je kreirana.`);
            }
            closeDialog();
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Greška pri spremanju radionice.");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleRegister = async (workshop: LiveWorkshop) => {
        try {
            validateRequirements(workshop.requirements);
            const registration = await registerForWorkshop({
                workshopId: workshop.id
            });
            setSuccessMessage(`Prijavili ste se na radionicu "${workshop.title}".`);
            setSelectedWorkshop(workshop);
            setTimeout(() => {
                if (registration.notifications.length) {
                    clearNotifications(registration.id);
                }
            }, 4000);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Prijava nije uspjela. Pokušajte ponovno.");
            }
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    // TODO: Implementirati provjeru preduvjeta preko API-ja
    // Za sada samo provjeravamo da li postoje preduvjeti
    // U budućnosti treba provjeriti da li je korisnik završio lekcije/kurseve
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validateRequirements = (_requirements: WorkshopRequirement[] | undefined) => {
        // Placeholder funkcija - implementacija kasnije
        // requirements se koristi u budućnosti za validaciju
    };

    const handleSyncCalendar = async (workshop: LiveWorkshop) => {
        try {
            await syncCalendar({workshopId: workshop.id});
            setSuccessMessage(`Termin radionice "${workshop.title}" sinkroniziran je s kalendarom.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Greška pri sinkronizaciji kalendara.");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleSimulateReconnect = async (workshop: LiveWorkshop) => {
        try {
            await updateWorkshopStatus({
                workshopId: workshop.id,
                status: "in_progress",
                connectionStatus: "reconnecting"
            });
            setShowSimulationMessage(`Radionica "${workshop.title}" pokušava ponovno uspostaviti vezu...`);
            setTimeout(() => setShowSimulationMessage(null), 4000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Greška pri ažuriranju statusa.");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleStartWorkshop = async (workshop: LiveWorkshop) => {
        try {
            await updateWorkshopStatus({
                workshopId: workshop.id,
                status: "in_progress",
                connectionStatus: "stable"
            });
            setSuccessMessage(`Radionica "${workshop.title}" je započela.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Greška pri pokretanju radionice.");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleCompleteWorkshop = async (workshop: LiveWorkshop) => {
        try {
            await updateWorkshopStatus({
                workshopId: workshop.id,
                status: "completed",
                connectionStatus: "stable"
            });
            setSuccessMessage(`Radionica "${workshop.title}" je završila.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Greška pri završetku radionice.");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleSelectWorkshop = (workshop: LiveWorkshop) => {
        setSelectedWorkshop(workshop);
        if (workshop.requirements.length) {
            workshop.requirements.forEach(requirement => {
                if (requirement.type === "completedLesson" && requirement.lessonId) {
                    markLessonStarted(requirement.lessonId);
                }
            });
        }
    };

    return (
        <Box>
            <Stack direction={{xs: "column", md: "row"}} justifyContent="space-between" alignItems={{xs: "stretch", md: "center"}} gap={2}>
                <Box>
                    <Typography variant="h4">
                        Live radionice
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Organizirajte nove radionice, sinkronizirajte termine s kalendarom i omogućite polaznicima da se prijave.
                    </Typography>
                </Box>
                <Button variant="contained" onClick={openDialogForCreate}>
                    Kreiraj novu radionicu
                </Button>
            </Stack>

            <Stack spacing={2} sx={{mt: 3}}>
                {workshopsLoading && (
                    <Box sx={{display: "flex", justifyContent: "center", p: 2}}>
                        <CircularProgress />
                    </Box>
                )}
                {workshopsError && (
                    <Alert severity="error" onClose={() => {}}>
                        {workshopsError}
                    </Alert>
                )}
                {successMessage && (
                    <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                        {successMessage}
                    </Alert>
                )}
                {errorMessage && (
                    <Alert severity="error" onClose={() => setErrorMessage(null)}>
                        {errorMessage}
                    </Alert>
                )}
                {showSimulationMessage && (
                    <Alert severity="info" onClose={() => setShowSimulationMessage(null)}>
                        {showSimulationMessage}
                    </Alert>
                )}
            </Stack>

            <Box sx={{mt: 1}}>
                {inProgressWorkshops.length > 0 && (
                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>
                            Radionice u tijeku
                        </Typography>
                        <WorkshopGrid
                            workshops={inProgressWorkshops}
                            getRegistrationsForWorkshop={getRegistrationsForWorkshop}
                            getUserRegistration={getUserRegistration}
                            onEdit={openDialogForEdit}
                            onSelect={handleSelectWorkshop}
                            onRegister={handleRegister}
                            onSyncCalendar={handleSyncCalendar}
                            onSimulateReconnect={handleSimulateReconnect}
                            onStart={handleStartWorkshop}
                            onComplete={handleCompleteWorkshop}
                            session={session}
                        />
                    </Box>
                )}

                {upcomingWorkshops.length > 0 && (
                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>
                            Nadolazeće radionice
                        </Typography>
                        <WorkshopGrid
                            workshops={upcomingWorkshops}
                            getRegistrationsForWorkshop={getRegistrationsForWorkshop}
                            getUserRegistration={getUserRegistration}
                            onEdit={openDialogForEdit}
                            onSelect={handleSelectWorkshop}
                            onRegister={handleRegister}
                            onSyncCalendar={handleSyncCalendar}
                            onSimulateReconnect={handleSimulateReconnect}
                            onStart={handleStartWorkshop}
                            onComplete={handleCompleteWorkshop}
                            session={session}
                        />
                    </Box>
                )}

                {pastWorkshops.length > 0 && (
                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>
                            Održane radionice
                        </Typography>
                        <WorkshopGrid
                            workshops={pastWorkshops}
                            getRegistrationsForWorkshop={getRegistrationsForWorkshop}
                            getUserRegistration={getUserRegistration}
                            onEdit={openDialogForEdit}
                            onSelect={handleSelectWorkshop}
                            onRegister={handleRegister}
                            onSyncCalendar={handleSyncCalendar}
                            onSimulateReconnect={handleSimulateReconnect}
                            onStart={handleStartWorkshop}
                            onComplete={handleCompleteWorkshop}
                            session={session}
                        />
                    </Box>
                )}

                {sortedWorkshops.length === 0 && (
                    <Box>
                        <Paper variant="outlined" className="workshop-empty-state" sx={{p: 4, textAlign: "center"}}>
                            <Typography variant="h6" gutterBottom>
                                Još nema zakazanih radionica
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Kreirajte prvu radionicu kako bi polaznici mogli sudjelovati u live edukacijama.
                            </Typography>
                            <Button variant="contained" sx={{mt: 2}} onClick={openDialogForCreate}>
                                Kreiraj radionicu
                            </Button>
                        </Paper>
                    </Box>
                )}
            </Box>

            <Dialog open={isDialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingWorkshopId ? "Ažuriraj radionicu" : "Nova live radionica"}</DialogTitle>
                <Box component="form" onSubmit={handleWorkshopSubmit}>
                    <DialogContent dividers sx={{display: "flex", flexDirection: "column", gap: 3}}>
                        <TextField
                            label="Naziv radionice"
                            name="title"
                            value={formState.title}
                            onChange={handleFormChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Opis"
                            name="description"
                            value={formState.description}
                            onChange={handleFormChange}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label="Termin"
                            name="scheduledAt"
                            type="datetime-local"
                            value={formState.scheduledAt}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            InputLabelProps={{shrink: true}}
                        />
                        <Stack direction={{xs: "column", md: "row"}} spacing={2}>
                            <TextField
                                label="Trajanje (minute)"
                                name="durationMinutes"
                                type="number"
                                value={formState.durationMinutes}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                inputProps={{min: 1}}
                            />
                            <TextField
                                label="Kapacitet"
                                name="capacity"
                                type="number"
                                value={formState.capacity}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                inputProps={{min: 1}}
                            />
                        </Stack>
                        <TextField
                            label="Link za video platformu"
                            name="meetingUrl"
                            value={formState.meetingUrl}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            helperText="Npr. https://meet.mock/kuhaona-workshop"
                        />

                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Preduvjeti za sudjelovanje
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {requirementTemplates.map(requirement => {
                                    const selected = formState.requirements.some(item => item.id === requirement.id);
                                    return (
                                        <Chip
                                            key={requirement.id}
                                            label={requirement.description}
                                            color={selected ? "primary" : "default"}
                                            variant={selected ? "filled" : "outlined"}
                                            onClick={() => toggleRequirement(requirement)}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog}>Odustani</Button>
                        <Button type="submit" variant="contained">
                            {editingWorkshopId ? "Spremi promjene" : "Kreiraj radionicu"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <WorkshopDetailsDrawer
                workshop={selectedWorkshop}
                onClose={() => setSelectedWorkshop(null)}
                getRegistrationsForWorkshop={getRegistrationsForWorkshop}
                getUserRegistration={getUserRegistration}
                clearNotifications={clearNotifications}
                session={session}
            />
        </Box>
    );
}

type WorkshopGridProps = {
    workshops: LiveWorkshop[];
    getRegistrationsForWorkshop: (workshopId: string) => ReturnType<typeof useLiveWorkshops>["registrations"];
    getUserRegistration: ReturnType<typeof useLiveWorkshops>["getUserRegistration"];
    onEdit: (workshop: LiveWorkshop) => void;
    onSelect: (workshop: LiveWorkshop) => void;
    onRegister: (workshop: LiveWorkshop) => void;
    onSyncCalendar: (workshop: LiveWorkshop) => void;
    onSimulateReconnect: (workshop: LiveWorkshop) => void;
    onStart: (workshop: LiveWorkshop) => void;
    onComplete: (workshop: LiveWorkshop) => void;
    session: { user?: { id?: string; name?: string | null } } | null;
};

const WorkshopGrid = ({
    workshops,
    getRegistrationsForWorkshop,
    getUserRegistration,
    onEdit,
    onSelect,
    onRegister,
    onSyncCalendar,
    onSimulateReconnect,
    onStart,
    onComplete,
    session
}: WorkshopGridProps) => {
    return (
        <Box
            sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))"
                }
            }}
        >
            {workshops.map(workshop => {
                const registrations = getRegistrationsForWorkshop(workshop.id);
                const userRegistration = session?.user?.id
                    ? getUserRegistration(workshop.id, session.user.id)
                    : undefined;
                const spotsLeft = workshop.capacity - registrations.length;

                return (
                    <Box key={workshop.id}>
                        <Paper
                            className="workshop-card"
                            variant="outlined"
                            sx={{
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                borderRadius: 2,
                                transition: "box-shadow 0.2s ease",
                                cursor: "pointer",
                                "&:hover": {
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => onSelect(workshop)}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h6">{workshop.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {workshop.description || "Instruktor nije dodao opis."}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={event => handleCardEdit(event, workshop, onEdit)}>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        Uredi
                                    </Typography>
                                </IconButton>
                            </Stack>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                    Termin:
                                </Typography>
                                <Typography variant="body2">
                                    {new Date(workshop.scheduledAt).toLocaleString("hr-HR", {
                                        dateStyle: "full",
                                        timeStyle: "short"
                                    })}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                    Kapacitet:
                                </Typography>
                                <Typography variant="body2">
                                    {registrations.length} / {workshop.capacity} polaznika (preostalo {spotsLeft > 0 ? spotsLeft : 0})
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                    Video link:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {workshop.meetingUrl}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={`Status: ${statusLabel(workshop.status)}`} color={statusColor(workshop.status)} />
                                {workshop.calendarSyncedAt && (
                                    <Chip label="Sinkronizirano s kalendarom" variant="outlined" color="success" />
                                )}
                                <Chip
                                    label={`Veza: ${
                                        workshop.lastConnectionStatus === "reconnecting"
                                            ? "ponovno povezivanje"
                                            : workshop.lastConnectionStatus ?? "stabilna"
                                    }`}
                                    variant="outlined"
                                />
                            </Stack>

                            {workshop.requirements.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Preduvjeti:
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                        {workshop.requirements.map(requirement => (
                                            <Chip key={requirement.id} label={requirement.description} size="small" />
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Divider />
                            <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} justifyContent="space-between" alignItems={{xs: "stretch", sm: "center"}}>
                                <Button
                                    variant="outlined"
                                    onClick={event => {
                                        event.stopPropagation();
                                        onSyncCalendar(workshop);
                                    }}
                                >
                                    Sinkroniziraj kalendar
                                </Button>
                                {workshop.status === "upcoming" && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={spotsLeft <= 0 || Boolean(userRegistration)}
                                        onClick={event => {
                                            event.stopPropagation();
                                            onRegister(workshop);
                                        }}
                                    >
                                        {spotsLeft <= 0 ? "Popunjeno" : userRegistration ? "Prijavljeni ste" : "Prijavi se"}
                                    </Button>
                                )}
                                {workshop.status === "upcoming" && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={event => {
                                            event.stopPropagation();
                                            onStart(workshop);
                                        }}
                                    >
                                        Pokreni radionicu
                                    </Button>
                                )}
                                {workshop.status === "in_progress" && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={event => {
                                            event.stopPropagation();
                                            onComplete(workshop);
                                        }}
                                    >
                                        Zaključi radionicu
                                    </Button>
                                )}
                                {workshop.status === "in_progress" && (
                                    <Button
                                        variant="text"
                                        color="warning"
                                        onClick={event => {
                                            event.stopPropagation();
                                            onSimulateReconnect(workshop);
                                        }}
                                    >
                                        Simuliraj prekid veze
                                    </Button>
                                )}
                            </Stack>
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
};

const handleCardEdit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    workshop: LiveWorkshop,
    onEdit: (workshop: LiveWorkshop) => void
) => {
    event.stopPropagation();
    onEdit(workshop);
};

const statusLabel = (status: LiveWorkshop["status"]) => {
    switch (status) {
        case "upcoming":
            return "u pripremi";
        case "in_progress":
            return "u tijeku";
        case "completed":
            return "završena";
        case "cancelled":
        default:
            return "otkazana";
    }
};

const statusColor = (status: LiveWorkshop["status"]) => {
    switch (status) {
        case "upcoming":
            return "info";
        case "in_progress":
            return "warning";
        case "completed":
            return "success";
        case "cancelled":
        default:
            return "default";
    }
};

type WorkshopDetailsDrawerProps = {
    workshop: LiveWorkshop | null;
    onClose: () => void;
    getRegistrationsForWorkshop: ReturnType<typeof useLiveWorkshops>["getRegistrationsForWorkshop"];
    getUserRegistration: ReturnType<typeof useLiveWorkshops>["getUserRegistration"];
    clearNotifications: ReturnType<typeof useLiveWorkshops>["clearNotifications"];
    session: { user?: { id?: string; name?: string | null } } | null;
};

const WorkshopDetailsDrawer = ({
    workshop,
    onClose,
    getRegistrationsForWorkshop,
    getUserRegistration,
    clearNotifications,
    session
}: WorkshopDetailsDrawerProps) => {
    if (!workshop) {
        return null;
    }

    const registrations = getRegistrationsForWorkshop(workshop.id);
    const userRegistration = session?.user?.id
        ? getUserRegistration(workshop.id, session.user.id)
        : undefined;

    return (
        <Dialog open={Boolean(workshop)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{workshop.title}</DialogTitle>
            <DialogContent dividers sx={{display: "flex", flexDirection: "column", gap: 3}}>
                <Typography variant="body1">{workshop.description || "Instruktor nije dodao detaljan opis."}</Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                        Termin:
                    </Typography>
                    <Typography variant="body2">
                        {new Date(workshop.scheduledAt).toLocaleString("hr-HR", {
                            dateStyle: "full",
                            timeStyle: "short"
                        })}{" "}
                        · {workshop.durationMinutes} minuta
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                        Kapacitet:
                    </Typography>
                    <Typography variant="body2">
                        Kapacitet: {registrations.length} / {workshop.capacity}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                        Video link:
                    </Typography>
                    <Typography variant="body2">
                        Link za radionicu:{" "}
                        <Button
                            component="a"
                            href={workshop.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="text"
                            sx={{textTransform: "none"}}
                        >
                            {workshop.meetingUrl}
                        </Button>
                    </Typography>
                </Stack>

                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Instruktor
                    </Typography>
                    <Typography variant="body2">{workshop.instructorName}</Typography>
                </Box>

                {workshop.requirements.length > 0 ? (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Preduvjeti za sudjelovanje
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {workshop.requirements.map(requirement => (
                                <Chip key={requirement.id} label={requirement.description} />
                            ))}
                        </Stack>
                    </Box>
                ) : (
                    <Alert severity="info">Nema dodatnih preduvjeta za ovu radionicu.</Alert>
                )}

                <Divider />

                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Prijavljeni polaznici ({registrations.length})
                    </Typography>
                    {registrations.length ? (
                        <Stack spacing={1.5}>
                            {registrations.map(registration => (
                                <Paper key={registration.id} variant="outlined" sx={{p: 1.5}}>
                                    <Typography variant="body2">
                                        {registration.userName} · {new Date(registration.registeredAt).toLocaleString("hr-HR")}
                                    </Typography>
                                    {registration.notifications.length > 0 && (
                                        <Alert
                                            severity="info"
                                            sx={{mt: 1}}
                                            action={
                                                <Button color="inherit" size="small" onClick={() => clearNotifications(registration.id)}>
                                                    Potvrdi
                                                </Button>
                                            }
                                        >
                                            <Stack spacing={1}>
                                                {registration.notifications.map(notification => (
                                                    <Typography key={notification.id} variant="body2">
                                                        {notification.message}
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </Alert>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Još nema prijava za ovu radionicu.
                        </Typography>
                    )}
                </Box>

                {userRegistration?.notifications.length ? (
                    <Alert
                        severity="info"
                        action={
                            <Button color="inherit" size="small" onClick={() => clearNotifications(userRegistration.id)}>
                                Potvrdi
                            </Button>
                        }
                    >
                        <Stack spacing={1}>
                            {userRegistration.notifications.map(notification => (
                                <Typography key={notification.id} variant="body2">
                                    {notification.message}
                                </Typography>
                            ))}
                        </Stack>
                    </Alert>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zatvori</Button>
            </DialogActions>
        </Dialog>
    );
};