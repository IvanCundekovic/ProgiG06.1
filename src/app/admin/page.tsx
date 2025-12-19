"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import type { SelectChangeEvent } from "@mui/material";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
    _count: {
        courses: number;
        quizResults: number;
        lessonReviews: number;
    };
}

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
    lesson: {
        id: string;
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
}

export default function AdminPanel() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<string>("");
    const [editVerified, setEditVerified] = useState<boolean>(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/LoginPage");
            return;
        }

        if (session?.user?.role !== "ADMINISTRATOR") {
            setError("Nemate pristup admin panelu");
            return;
        }

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 0) {
                const response = await fetch("/api/admin/users");
                if (!response.ok) throw new Error("Greška pri učitavanju korisnika");
                const data = await response.json();
                setUsers(data);
            } else if (activeTab === 1) {
                const response = await fetch("/api/admin/reviews");
                if (!response.ok) throw new Error("Greška pri učitavanju recenzija");
                const data = await response.json();
                setReviews(data);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setError(err instanceof Error ? err.message : "Greška pri učitavanju podataka");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "ADMINISTRATOR") {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, session]);

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setEditVerified(user.isVerified);
        setEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    role: editRole,
                    isVerified: editVerified,
                }),
            });

            if (!response.ok) throw new Error("Greška pri ažuriranju korisnika");

            await loadData();
            setEditDialogOpen(false);
            setSelectedUser(null);
        } catch (err) {
            console.error("Error updating user:", err);
            setError(err instanceof Error ? err.message : "Greška pri ažuriranju korisnika");
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/admin/users?userId=${userToDelete}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Greška pri brisanju korisnika");

            await loadData();
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err instanceof Error ? err.message : "Greška pri brisanju korisnika");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Jeste li sigurni da želite obrisati ovu recenziju?")) return;

        try {
            const response = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Greška pri brisanju recenzije");

            await loadData();
        } catch (err) {
            console.error("Error deleting review:", err);
            setError(err instanceof Error ? err.message : "Greška pri brisanju recenzije");
        }
    };

    if (status === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (session?.user?.role !== "ADMINISTRATOR") {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Nemate pristup admin panelu</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Panel
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ mt: 2 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Korisnici" />
                    <Tab label="Recenzije" />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {activeTab === 0 && (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Ime</TableCell>
                                            <TableCell>Uloga</TableCell>
                                            <TableCell>Verificiran</TableCell>
                                            <TableCell>Tečajevi</TableCell>
                                            <TableCell>Kvizovi</TableCell>
                                            <TableCell>Recenzije</TableCell>
                                            <TableCell>Akcije</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.name || "-"}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.role}
                                                        color={
                                                            user.role === "ADMINISTRATOR"
                                                                ? "error"
                                                                : user.role === "INSTRUCTOR"
                                                                ? "warning"
                                                                : "default"
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {user.isVerified ? (
                                                        <Chip
                                                            icon={<VerifiedIcon />}
                                                            label="Da"
                                                            color="success"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Chip
                                                            icon={<BlockIcon />}
                                                            label="Ne"
                                                            color="default"
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>{user._count.courses}</TableCell>
                                                <TableCell>{user._count.quizResults}</TableCell>
                                                <TableCell>{user._count.lessonReviews}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setUserToDelete(user.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {activeTab === 1 && (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Korisnik</TableCell>
                                            <TableCell>Lekcija</TableCell>
                                            <TableCell>Ocjena</TableCell>
                                            <TableCell>Komentar</TableCell>
                                            <TableCell>Datum</TableCell>
                                            <TableCell>Akcije</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reviews.map((review) => (
                                            <TableRow key={review.id}>
                                                <TableCell>{review.userName}</TableCell>
                                                <TableCell>
                                                    {review.lesson.course.title} - {review.lesson.title}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={`${review.rating}/5`} color="primary" size="small" />
                                                </TableCell>
                                                <TableCell>{review.comment || "-"}</TableCell>
                                                <TableCell>
                                                    {new Date(review.createdAt).toLocaleDateString("hr-HR")}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteReview(review.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}
            </Paper>

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Uredi korisnika</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Uloga</InputLabel>
                        <Select
                            value={editRole}
                            onChange={(e: SelectChangeEvent) => setEditRole(e.target.value)}
                            label="Uloga"
                        >
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="INSTRUCTOR">Instruktor</MenuItem>
                            <MenuItem value="ADMINISTRATOR">Administrator</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Verificiran</InputLabel>
                        <Select
                            value={editVerified ? "true" : "false"}
                            onChange={(e: SelectChangeEvent) => setEditVerified(e.target.value === "true")}
                            label="Verificiran"
                        >
                            <MenuItem value="true">Da</MenuItem>
                            <MenuItem value="false">Ne</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Odustani</Button>
                    <Button onClick={handleSaveUser} variant="contained">
                        Spremi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Brisanje korisnika</DialogTitle>
                <DialogContent>
                    <Typography>Jeste li sigurni da želite obrisati ovog korisnika? Ova akcija je nepovratna.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Odustani</Button>
                    <Button onClick={handleDeleteUser} variant="contained" color="error">
                        Obriši
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
