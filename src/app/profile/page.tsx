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
    
    // Instructor profile data
    const [biography, setBiography] = useState("");
    const [recipeList, setRecipeList] = useState<string[]>([]);
    const [availableLessons, setAvailableLessons] = useState<Array<{ id: string; title: string }>>([]);
    const [verificationDocuments, setVerificationDocuments] = useState<string[]>([]);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/LoginPage");
            return;
        }

        if (status === "authenticated") {
            loadProfile();
        }
    }, [status, router]);

    // UC-5: ako je prisilna promjena lozinke, prebaci na tab "Promjena lozinke"
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const force = params.get("forcePasswordChange") === "1";
        if (force || session?.user?.mustChangePassword) {
            // Adjust tab index based on whether user is instructor
            const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR";
            setActiveTab(isInstructor ? 3 : 2);
        }
    }, [session?.user?.mustChangePassword, session?.user?.role]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/profile");
            if (!response.ok) throw new Error("Greška pri učitavanju profila");
            const data = await response.json();

            setName(data.name || "");
            setSkillLevel(data.userProfile?.skillLevel || "");
            setAllergies(safeParseArray(data.userProfile?.allergies));
            setFavoriteCuisines(safeParseArray(data.userProfile?.favoriteCuisines));
            setDietaryRestrictions(safeParseArray(data.userProfile?.dietaryRestrictions));
            setNotes(data.userProfile?.notes || "");
            setIsVerified(data.isVerified || false);
            
            // Load instructor profile if user is instructor
            if (data.role === "INSTRUCTOR" || data.role === "ADMINISTRATOR") {
                setBiography(data.instructorProfile?.biography || "");
                setRecipeList(safeParseArray(data.instructorProfile?.recipeList));
                
                // Load verification documents
                if (data.verificationDocuments) {
                    setVerificationDocuments(safeParseArray(data.verificationDocuments));
                }
                
                // Load available lessons for recipe selection
                try {
                    const coursesResponse = await fetch("/api/courses");
                    if (coursesResponse.ok) {
                        const courses = await coursesResponse.json();
                        const allLessons: Array<{ id: string; title: string }> = [];
                        courses.forEach((course: { lessons?: Array<{ id: string; title: string }> }) => {
                            if (course.lessons && Array.isArray(course.lessons)) {
                                course.lessons.forEach((lesson: { id: string; title: string }) => {
                                    allLessons.push({ id: lesson.id, title: lesson.title });
                                });
                            }
                        });
                        setAvailableLessons(allLessons);
                    }
                } catch (err) {
                    console.error("Error loading lessons:", err);
                }
            }
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

            const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR";
            const requestBody: {
                name: string;
                skillLevel: string | null;
                allergies: string[] | null;
                favoriteCuisines: string[] | null;
                dietaryRestrictions: string[] | null;
                notes: string | null;
                biography?: string | null;
                recipeList?: string[] | null;
                verificationDocuments?: string[] | null;
            } = {
                name,
                skillLevel: skillLevel || null,
                allergies: safeAllergies.length > 0 ? safeAllergies : null,
                favoriteCuisines: safeFavoriteCuisines.length > 0 ? safeFavoriteCuisines : null,
                dietaryRestrictions: safeDietaryRestrictions.length > 0 ? safeDietaryRestrictions : null,
                notes: notes || null,
            };
            
            // Add instructor profile fields if user is instructor
            if (isInstructor) {
                requestBody.biography = biography || null;
                requestBody.recipeList = recipeList.length > 0 ? recipeList : null;
                requestBody.verificationDocuments = verificationDocuments.length > 0 ? verificationDocuments : null;
            }

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
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

    // Safe arrays for rendering - ensures they're never null/undefined
    const safeAllergies = allergies ?? [];
    const safeFavoriteCuisines = favoriteCuisines ?? [];
    const safeDietaryRestrictions = dietaryRestrictions ?? [];
    
    // Calculate tab indices dynamically based on user role
    const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR";
    const passwordChangeTabIndex = isInstructor ? 3 : 2;
    const gdprTabIndex = isInstructor ? 4 : 3;

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
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Osnovni podaci" />
                    <Tab label="Preferencije" />
                    {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR") && (
                        <Tab label="Instruktor profil" />
                    )}
                    <Tab label="Promjena lozinke" />
                    <Tab label="GDPR & Sigurnost" />
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

                {(session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR") && activeTab === 2 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Biografija
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Biografija"
                            value={biography}
                            onChange={(e) => setBiography(e.target.value)}
                            placeholder="Napišite nešto o sebi, vašem iskustvu i posebnostima..."
                            sx={{ mb: 3 }}
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Popis recepta
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Odaberite lekcije/recepte koje želite prikazati u svom profilu
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Dostupni recepti</InputLabel>
                            <Select<string[]>
                                multiple
                                value={recipeList}
                                onChange={(e: SelectChangeEvent<string[]>) => {
                                    const value = e.target.value;
                                    setRecipeList(typeof value === "string" ? value.split(",") : value);
                                }}
                                label="Dostupni recepti"
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((recipeId) => {
                                            const lesson = availableLessons.find((l) => l.id === recipeId);
                                            return <Chip key={recipeId} label={lesson?.title || recipeId} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {availableLessons.map((lesson) => (
                                    <MenuItem key={lesson.id} value={lesson.id}>
                                        {lesson.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                            {recipeList.map((recipeId) => {
                                const lesson = availableLessons.find((l) => l.id === recipeId);
                                return (
                                    <Chip
                                        key={recipeId}
                                        label={lesson?.title || recipeId}
                                        onDelete={() => setRecipeList(recipeList.filter((id) => id !== recipeId))}
                                    />
                                );
                            })}
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Verifikacijski dokumenti
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Uploadajte dokumente za verifikaciju (npr. certifikate, diplome, iskaznice). PDF, JPG, PNG formati su podržani.
                        </Typography>
                        
                        {/* Prikaz trenutnih dokumenata */}
                        {verificationDocuments.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Uploadani dokumenti:
                                </Typography>
                                <Stack direction="column" spacing={1}>
                                    {verificationDocuments.map((doc, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                p: 1,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                                                Dokument {index + 1}
                                            </Typography>
                                            <Button
                                                size="small"
                                                href={doc}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ mr: 1 }}
                                            >
                                                Pregled
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const newDocs = verificationDocuments.filter((_, i) => i !== index);
                                                    setVerificationDocuments(newDocs);
                                                }}
                                            >
                                                Obriši
                                            </Button>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* File upload */}
                        <input
                            accept="application/pdf,image/*"
                            style={{ display: "none" }}
                            id="verification-document-upload"
                            type="file"
                            multiple
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                setUploadingDocuments(true);
                                try {
                                    const newDocs: string[] = [...verificationDocuments];

                                    // Convert files to base64 data URLs
                                    for (let i = 0; i < files.length; i++) {
                                        const file = files[i];
                                        const maxSize = 10 * 1024 * 1024; // 10MB
                                        if (file.size > maxSize) {
                                            setError(`Datoteka ${file.name} je prevelika (max 10MB)`);
                                            continue;
                                        }

                                        const reader = new FileReader();
                                        const base64Promise = new Promise<string>((resolve, reject) => {
                                            reader.onload = () => {
                                                if (typeof reader.result === "string") {
                                                    resolve(reader.result);
                                                } else {
                                                    reject(new Error("Failed to read file"));
                                                }
                                            };
                                            reader.onerror = reject;
                                        });

                                        reader.readAsDataURL(file);
                                        const dataUrl = await base64Promise;
                                        newDocs.push(dataUrl);
                                    }

                                    setVerificationDocuments(newDocs);
                                    setUploadingDocuments(false);
                                    
                                    // Reset file input
                                    e.target.value = "";
                                } catch (err) {
                                    console.error("Error uploading documents:", err);
                                    setError("Greška pri upload-u dokumenata");
                                    setUploadingDocuments(false);
                                }
                            }}
                        />
                        <label htmlFor="verification-document-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                disabled={uploadingDocuments}
                                sx={{ mb: 2 }}
                            >
                                {uploadingDocuments ? <CircularProgress size={24} /> : "Dodaj dokumente"}
                            </Button>
                        </label>

                        {isVerified && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Vaš profil je verificiran.
                            </Alert>
                        )}

                        <Button variant="contained" onClick={handleSaveProfile} disabled={saving} sx={{ mt: 2, display: "block" }}>
                            {saving ? <CircularProgress size={24} /> : "Spremi"}
                        </Button>
                    </Box>
                )}

                {activeTab === passwordChangeTabIndex && (
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

                {activeTab === gdprTabIndex && (
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