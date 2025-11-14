# Admin Panel - Primjer Implementacije

## 📋 Pregled

Admin panel bi bio Next.js stranica (`/admin`) za upravljanje kursevima, lekcijama, kvizovima i radionicama.

## 🎨 Struktura Admin Panela

### **1. Admin Dashboard** (`/admin`)

```typescript
// src/app/admin/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    quizzes: 0,
    workshops: 0,
    users: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMINISTRATOR" && session?.user?.role !== "INSTRUCTOR") {
      router.push("/");
      return;
    }

    // Učitaj statistike
    loadStats();
  }, [session, status, router]);

  const loadStats = async () => {
    try {
      const [coursesRes, lessonsRes, quizzesRes, workshopsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/lessons"),
        fetch("/api/quizzes"),
        fetch("/api/workshops"),
      ]);

      const courses = await coursesRes.json();
      const lessons = await lessonsRes.json();
      const quizzes = await quizzesRes.json();
      const workshops = await workshopsRes.json();

      setStats({
        courses: courses.length,
        lessons: lessons.length,
        quizzes: quizzes.length,
        workshops: workshops.length,
        users: 0, // Trebalo bi napraviti /api/users endpoint
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Kursevi</Typography>
              <Typography variant="h4">{stats.courses}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/admin/courses")}
                sx={{ mt: 2 }}
              >
                Upravljaj kursevima
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Lekcije</Typography>
              <Typography variant="h4">{stats.lessons}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/admin/lessons")}
                sx={{ mt: 2 }}
              >
                Upravljaj lekcijama
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Kvizovi</Typography>
              <Typography variant="h4">{stats.quizzes}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/admin/quizzes")}
                sx={{ mt: 2 }}
              >
                Upravljaj kvizovima
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Radionice</Typography>
              <Typography variant="h4">{stats.workshops}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/admin/workshops")}
                sx={{ mt: 2 }}
              >
                Upravljaj radionicama
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

---

### **2. Upravljanje Kursevima** (`/admin/courses`)

```typescript
// src/app/admin/courses/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useSession } from "next-auth/react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
}

export default function AdminCourses() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Greška pri učitavanju kurseva");
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju kurseva");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || "",
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: "", description: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    setFormData({ title: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingCourse
        ? `/api/courses/${editingCourse.id}`
        : "/api/courses";
      const method = editingCourse ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Greška pri spremanju kursa");
      }

      setSuccess(
        editingCourse
          ? "Kurs je uspješno ažuriran"
          : "Kurs je uspješno kreiran"
      );
      handleClose();
      loadCourses();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri spremanju kursa");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj kurs?")) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Greška pri brisanju kursa");

      setSuccess("Kurs je uspješno obrisan");
      loadCourses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri brisanju kursa");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Upravljanje Kursevima</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Dodaj Kurs
        </Button>
      </Box>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naziv</TableCell>
              <TableCell>Opis</TableCell>
              <TableCell>Instruktor</TableCell>
              <TableCell>Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>
                  {course.description?.substring(0, 50)}...
                </TableCell>
                <TableCell>{course.instructorName}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(course)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(course.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCourse ? "Uredi Kurs" : "Dodaj Novi Kurs"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Naziv kursa"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Opis"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Odustani</Button>
            <Button type="submit" variant="contained">
              {editingCourse ? "Ažuriraj" : "Kreiraj"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
```

---

### **3. Upravljanje Lekcijama** (`/admin/lessons`)

```typescript
// src/app/admin/lessons/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useSession } from "next-auth/react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  published: boolean;
  courseId: string;
}

interface Course {
  id: string;
  title: string;
}

export default function AdminLessons() {
  const { data: session } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    courseId: "",
    published: false,
    steps: "",
    ingredients: "",
    nutrition: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, coursesRes] = await Promise.all([
        fetch("/api/lessons"),
        fetch("/api/courses"),
      ]);

      if (!lessonsRes.ok) throw new Error("Greška pri učitavanju lekcija");
      if (!coursesRes.ok) throw new Error("Greška pri učitavanju kurseva");

      const lessonsData = await lessonsRes.json();
      const coursesData = await coursesRes.json();

      setLessons(lessonsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        courseId: lesson.courseId,
        published: lesson.published,
        steps: Array.isArray(lesson.steps)
          ? lesson.steps.join("\n")
          : "",
        ingredients: Array.isArray(lesson.ingredients)
          ? JSON.stringify(lesson.ingredients, null, 2)
          : "",
        nutrition: Array.isArray(lesson.nutrition)
          ? JSON.stringify(lesson.nutrition, null, 2)
          : "",
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: "",
        description: "",
        content: "",
        videoUrl: "",
        courseId: courses[0]?.id || "",
        published: false,
        steps: "",
        ingredients: "",
        nutrition: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Parse steps, ingredients, nutrition
      const steps = formData.steps
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let ingredients = [];
      let nutrition = [];

      try {
        ingredients = formData.ingredients
          ? JSON.parse(formData.ingredients)
          : [];
        nutrition = formData.nutrition ? JSON.parse(formData.nutrition) : [];
      } catch (parseError) {
        throw new Error("Nevažeći JSON format za ingredients ili nutrition");
      }

      const url = editingLesson
        ? `/api/lessons/${editingLesson.id}`
        : "/api/lessons";
      const method = editingLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          videoUrl: formData.videoUrl,
          courseId: formData.courseId,
          published: formData.published,
          steps,
          ingredients,
          nutrition,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Greška pri spremanju lekcije");
      }

      setSuccess(
        editingLesson
          ? "Lekcija je uspješno ažurirana"
          : "Lekcija je uspješno kreirana"
      );
      handleClose();
      loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri spremanju lekcije");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovu lekciju?")) return;

    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Greška pri brisanju lekcije");

      setSuccess("Lekcija je uspješno obrisana");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri brisanju lekcije");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Upravljanje Lekcijama</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          disabled={courses.length === 0}
        >
          Dodaj Lekciju
        </Button>
      </Box>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naziv</TableCell>
              <TableCell>Kurs</TableCell>
              <TableCell>Video URL</TableCell>
              <TableCell>Objavljeno</TableCell>
              <TableCell>Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>{lesson.title}</TableCell>
                <TableCell>
                  {courses.find((c) => c.id === lesson.courseId)?.title || "N/A"}
                </TableCell>
                <TableCell>
                  {lesson.videoUrl ? (
                    <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                      Video
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{lesson.published ? "Da" : "Ne"}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(lesson)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(lesson.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingLesson ? "Uredi Lekciju" : "Dodaj Novu Lekciju"}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Kurs</InputLabel>
              <Select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                required
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              autoFocus
              margin="dense"
              label="Naziv lekcije"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Opis"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Sadržaj"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Video URL"
              fullWidth
              variant="outlined"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Koraci (svaki korak u novom redu)"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.steps}
              onChange={(e) =>
                setFormData({ ...formData, steps: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Ingredients (JSON format)"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.ingredients}
              onChange={(e) =>
                setFormData({ ...formData, ingredients: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Nutrition (JSON format)"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.nutrition}
              onChange={(e) =>
                setFormData({ ...formData, nutrition: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                />
              }
              label="Objavljeno"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Odustani</Button>
            <Button type="submit" variant="contained">
              {editingLesson ? "Ažuriraj" : "Kreiraj"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
```

---

## 🚀 Kako Koristiti

### **1. Seed Skripta**

```bash
# Instaliraj tsx (ako već nije instaliran)
npm install -D tsx

# Pokreni seed skriptu
npm run db:seed

# Ili direktno s Prisma
npx prisma db seed
```

### **2. Admin Panel**

1. **Kreiraj admin korisnika** (kroz seed skriptu ili ručno)
2. **Prijavi se** kao admin
3. **Idi na** `/admin`
4. **Upravljaj** kursevima, lekcijama, kvizovima i radionicama

### **3. Zaštita Admin Panela**

Dodaj middleware za provjeru autorizacije:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Zaštiti admin rute
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMINISTRATOR" && role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 📝 Napomene

- Admin panel zahtijeva autentifikaciju i autorizaciju (ADMINISTRATOR ili INSTRUCTOR role)
- Svi API endpointi već podržavaju CRUD operacije
- Seed skripta popunjava bazu s početnim podacima
- Admin panel može se proširiti s dodatnim funkcionalnostima (upload slika, bulk operacije, itd.)

