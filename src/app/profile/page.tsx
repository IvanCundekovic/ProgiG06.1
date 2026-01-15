"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { SelectChangeEvent } from "@mui/material";

// Constants moved outside component to avoid re-creation on each render
const commonCuisines = ["Talijanska", "Francuska", "Azijska", "Mediteranska", "Meksička", "Indijska"];
const commonAllergens = ["Gluten", "Laktoza", "Jaja", "Riba", "Školjke", "Orašasti plodovi", "Soja"];
const commonDietary = ["Vegan", "Vegetarijanska", "Keto", "Bez glutena", "Paleo", "Low-carb"];

// Helper function to safely parse JSON arrays
const safeParseArray = (value: string | null | undefined): string[] => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Profile data - initialized with proper defaults
    const [name, setName] = useState("");
    const [skillLevel, setSkillLevel] = useState("");
    const [allergies, setAllergies] = useState<string[]>([]);
    const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
    const [notes, setNotes] = useState("");

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR";
    const [instructorBio, setInstructorBio] = useState("");
    const [myRecipes, setMyRecipes] = useState<any[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(false);
    const [verificationFile, setVerificationFile] = useState<File | null> (null);
    const [verificationStatus, setVerificationStatus] = useState<string | null> (null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/LoginPage");
            return;
        }

        if (status === "authenticated") {
            loadProfile();
        }

        if (activeTab === 4 && isInstructor) 
        {
            loadInstructorRecipes();
        }
    }, [status, router]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/profile");
            if (!response.ok) throw new Error("Greška pri učitavanju profila");
            const data = await response.json();

            setName(data.name || "");
            setSkillLevel(data.userProfile?.skillLevel || "");
            setInstructorBio(data.userProfile?.instructorBio || "");
            setAllergies(safeParseArray(data.userProfile?.allergies));
            setFavoriteCuisines(safeParseArray(data.userProfile?.favoriteCuisines));
            setDietaryRestrictions(safeParseArray(data.userProfile?.dietaryRestrictions));
            setNotes(data.userProfile?.notes || "");
        } catch (err) {
            console.error("Error loading profile:", err);
            setError(err instanceof Error ? err.message : "Greška pri učitavanju profila");
            // Ensure arrays are initialized even on error
            setAllergies([]);
            setFavoriteCuisines([]);
            setDietaryRestrictions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Safe access with fallback to empty arrays
            const safeAllergies = allergies ?? [];
            const safeFavoriteCuisines = favoriteCuisines ?? [];
            const safeDietaryRestrictions = dietaryRestrictions ?? [];

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    skillLevel: skillLevel || null,
                    allergies: safeAllergies.length > 0 ? safeAllergies : null,
                    favoriteCuisines: safeFavoriteCuisines.length > 0 ? safeFavoriteCuisines : null,
                    dietaryRestrictions: safeDietaryRestrictions.length > 0 ? safeDietaryRestrictions : null,
                    notes: notes || null,
                    instructorBio: isInstructor ? instructorBio : null,
                }),
            });

            if (!response.ok) throw new Error("Greška pri spremanju profila");

            setSuccess("Profil uspješno ažuriran");
            await loadProfile();
        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err instanceof Error ? err.message : "Greška pri spremanju profila");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("Nova lozinka i potvrda se ne podudaraju");
            return;
        }

        if (newPassword.length < 6) {
            setError("Lozinka mora imati najmanje 6 znakova");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch("/api/profile/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Greška pri promjeni lozinke");
            }

            setSuccess("Lozinka uspješno promijenjena");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Error changing password:", err);
            setError(err instanceof Error ? err.message : "Greška pri promjeni lozinke");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            const response = await fetch(`/api/users/${session?.user?.id}/delete`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Greška pri brisanju računa");
            }

            await signOut({ callbackUrl: "/" });
        } catch (err) {
            console.error("Error deleting account:", err);
            setError(err instanceof Error ? err.message : "Greška pri brisanju računa");
            setDeleteDialogOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddTag = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, tags: string[]) => {
        const safeTags = tags ?? [];
        if (value && !safeTags.includes(value)) {
            setter([...safeTags, value]);
        }
    };

    const handleRemoveTag = (tag: string, setter: React.Dispatch<React.SetStateAction<string[]>>, tags: string[]) => {
        const safeTags = tags ?? [];
        setter(safeTags.filter((t) => t !== tag));
    };

    if (status === "loading" || loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    const loadInstructorRecipes = async () => {
        try {
            setRecipesLoading(true);
            const res = await fetch("/api/courses");
            if (!res.ok) throw new Error ("Greška pri učitavanju recepata");
            setMyRecipes(await res.json()); 
        } finally {
            setRecipesLoading(false);
        }
    }

    const handleUploadVerification = async () => {
        if (!verificationFile) return;

        const formData = new FormData();
        formData.append("file", verificationFile);

        const res = await fetch("/api/instructors/verify", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            alert("Greška pri uploadu dokumenta");
            return;
        }

        setVerificationFile(null);
        alert("Dokument poslan na verifikaciju");
    };

    // Safe arrays for rendering - ensures they're never null/undefined
    const safeAllergies = allergies ?? [];
    const safeFavoriteCuisines = favoriteCuisines ?? [];
    const safeDietaryRestrictions = dietaryRestrictions ?? [];

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Moj Profil
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 3, mt: 2 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant = "scrollable" scrollButtons = "auto">
                    <Tab label="Osnovni podaci" />
                    <Tab label="Preferencije" />
                    <Tab label="Promjena lozinke" />
                    <Tab label="GDPR & Sigurnost" />
                    {isInstructor && <Tab label = "Moji recepti" />}
                    {isInstructor && <Tab label = "Biografija"/>}
                    {isInstructor && <Tab label = "Verifikacija"/>}
                </Tabs>

                {activeTab === 0 && (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            label="Ime"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Razina vještine</InputLabel>
                            <Select
                                value={skillLevel}
                                onChange={(e: SelectChangeEvent) => setSkillLevel(e.target.value)}
                                label="Razina vještine"
                            >
                                <MenuItem value="">Nije odabrano</MenuItem>
                                <MenuItem value="beginner">Početnik</MenuItem>
                                <MenuItem value="intermediate">Srednji</MenuItem>
                                <MenuItem value="advanced">Napredni</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Bilješke"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSaveProfile}
                            disabled={saving}
                            sx={{ mt: 2 }}
                        >
                            {saving ? <CircularProgress size={24} /> : "Spremi"}
                        </Button>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Alergije
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                            {safeAllergies.map((allergy) => (
                                <Chip
                                    key={allergy}
                                    label={allergy}
                                    onDelete={() => handleRemoveTag(allergy, setAllergies, safeAllergies)}
                                />
                            ))}
                        </Stack>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Dodaj alergen</InputLabel>
                            <Select
                                value=""
                                onChange={(e: SelectChangeEvent) =>
                                    handleAddTag(e.target.value, setAllergies, safeAllergies)
                                }
                                label="Dodaj alergen"
                            >
                                {commonAllergens
                                    .filter((a) => !safeAllergies.includes(a))
                                    .map((allergen) => (
                                        <MenuItem key={allergen} value={allergen}>
                                            {allergen}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Omiljene kuhinje
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                            {safeFavoriteCuisines.map((cuisine) => (
                                <Chip
                                    key={cuisine}
                                    label={cuisine}
                                    onDelete={() => handleRemoveTag(cuisine, setFavoriteCuisines, safeFavoriteCuisines)}
                                />
                            ))}
                        </Stack>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Dodaj kuhinju</InputLabel>
                            <Select
                                value=""
                                onChange={(e: SelectChangeEvent) =>
                                    handleAddTag(e.target.value, setFavoriteCuisines, safeFavoriteCuisines)
                                }
                                label="Dodaj kuhinju"
                            >
                                {commonCuisines
                                    .filter((c) => !safeFavoriteCuisines.includes(c))
                                    .map((cuisine) => (
                                        <MenuItem key={cuisine} value={cuisine}>
                                            {cuisine}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Prehrambeni planovi
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                            {safeDietaryRestrictions.map((restriction) => (
                                <Chip
                                    key={restriction}
                                    label={restriction}
                                    onDelete={() =>
                                        handleRemoveTag(restriction, setDietaryRestrictions, safeDietaryRestrictions)
                                    }
                                />
                            ))}
                        </Stack>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Dodaj prehrambeni plan</InputLabel>
                            <Select
                                value=""
                                onChange={(e: SelectChangeEvent) =>
                                    handleAddTag(e.target.value, setDietaryRestrictions, safeDietaryRestrictions)
                                }
                                label="Dodaj prehrambeni plan"
                            >
                                {commonDietary
                                    .filter((d) => !safeDietaryRestrictions.includes(d))
                                    .map((diet) => (
                                        <MenuItem key={diet} value={diet}>
                                            {diet}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <Button variant="contained" onClick={handleSaveProfile} disabled={saving} sx={{ mt: 2 }}>
                            {saving ? <CircularProgress size={24} /> : "Spremi"}
                        </Button>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Trenutna lozinka"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Nova lozinka"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Potvrdi novu lozinku"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" onClick={handleChangePassword} disabled={saving}>
                            {saving ? <CircularProgress size={24} /> : "Promijeni lozinku"}
                        </Button>
                    </Box>
                )}

                {activeTab === 3 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            GDPR - Vaša prava
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            U skladu s GDPR-om, imate pravo pristupa, ispravka i brisanja svojih osobnih podataka.
                        </Typography>

                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.push("/privacy")}
                                fullWidth
                            >
                                Pregledaj Politiku privatnosti
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => router.push("/terms")}
                                fullWidth
                            >
                                Pregledaj Uvjete korištenja
                            </Button>

                            <Divider sx={{ my: 2 }} />

                            <Alert severity="warning">
                                <Typography variant="body2" gutterBottom>
                                    <strong>Brisanje računa (Right to be forgotten)</strong>
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Brisanjem računa trajno ćete obrisati sve svoje podatke uključujući profil, napredak,
                                    recenzije i certifikate. Ova akcija je nepovratna.
                                </Typography>
                            </Alert>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setDeleteDialogOpen(true)}
                                fullWidth
                            >
                                Obriši moj račun
                            </Button>
                        </Stack>
                    </Box>
                )}

                {activeTab === 4 && (
                    <Box sx={{ mt: 3 }}>
                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                        Moji recepti
                        </Typography>

                        {recipesLoading ? (
                        <CircularProgress />
                        ) : myRecipes.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Još nemate objavljenih recepata.
                        </Typography>
                        ) : (
                        <Stack spacing={1}>
                            {myRecipes.map((r) => (
                            <Paper key={r.id} sx={{ p: 2 }}>
                                <Typography fontWeight={600}>{r.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                Tečaj: {r.courseTitle}
                                </Typography>
                                {!r.published && (
                                <Chip size="small" label="Neobjavljeno" sx={{ mt: 1 }} />
                                )}
                            </Paper>
                            ))}
                        </Stack>
                        )}
                    </Box>
                )}
                {activeTab === 5 && (
                    <Box sx = {{ mt: 3 }}>
                        <Typography variant = "h6" gutterBottom>
                            Biografija instruktora
                        </Typography>

                        <TextField 
                            fullWidth
                            multiline
                            rows = {6}
                            label = "O meni"
                            placeholder = "Ispričajte studentima tko ste, vaše iskustvo, still kuhanja..."
                            value = {instructorBio}
                            onChange = {(e) => setInstructorBio(e.target.value)}
                        />

                        <Button 
                            variant = "contained"
                            onClick = {handleSaveProfile}
                            disabled = {saving}
                            sx = {{ mt: 2 }}
                        >
                        {saving ? <CircularProgress size = {24}/> : "Spremi biografiju"}
                        </Button>
                    </Box>
                )}
                {activeTab === 6 && (
                    <Box sx = {{ mt: 3 }}>
                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6">
                        Verifikacija instruktora
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Učitajte dokument (certifikat, diploma, identifikacija).
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Button variant="outlined" component="label">
                            Odaberi dokument
                            <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.png"
                                onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                            />
                            </Button>

                            {verificationFile && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Odabrano: {verificationFile.name}
                            </Typography>
                            )}

                            <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            disabled={!verificationFile}
                            onClick={handleUploadVerification}
                            >
                            Pošalji na verifikaciju
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Paper>

            {/* NF-006: GDPR - Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Brisanje računa</DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" paragraph>
                            <strong>Upozorenje:</strong> Ova akcija je trajna i nepovratna.
                        </Typography>
                        <Typography variant="body2" component="div">
                            Brisanjem računa obrisat će se:
                            <ul>
                                <li>Vaš korisnički profil</li>
                                <li>Svi vaši podaci (preferencije, alergije, itd.)</li>
                                <li>Povijest napretka i certifikati</li>
                                <li>Vaše recenzije i komentari</li>
                                <li>Sve ostale povezane podatke</li>
                            </ul>
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Ova akcija je u skladu s GDPR &quot;Right to be forgotten&quot; pravom.
                        </Typography>
                    </Alert>
                    <Typography variant="body2">
                        Jeste li sigurni da želite obrisati svoj račun?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Odustani</Button>
                    <Button
                        onClick={handleDeleteAccount}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size={24} /> : "Da, obriši račun"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}