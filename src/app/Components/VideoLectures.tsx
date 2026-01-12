"use client";

import {ChangeEvent, FormEvent, useMemo, useState, useEffect} from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack,
    Rating,
    TextField,
    Divider,
    Alert,
    Paper,
    CircularProgress,
    InputAdornment,
    FormControl,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    Checkbox
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import type {Course, Lesson} from "@/app/types/quiz";
import {useLessonFeedback} from "@/app/functions/useLessonFeedback";
import {useSession} from "next-auth/react";
import InstructorReviewDialog from "./InstructorReviewDialog";

// Fallback mock courses ako API ne vrati podatke
const mockCourses: Course[] = [
    {
        id: "course-1",
        title: "Osnove mediteranske kuhinje",
        description:
            "Naučite pripremiti klasična mediteranska jela uz fokus na svježe sastojke i zdrave tehnike kuhanja.",
        instructorId: "instructor-1",
        instructorName: "Ana Kovač",
        createdAt: new Date("2024-01-12"),
        lessons: [
            {
                id: "lesson-1",
                title: "Svježa tjestenina od nule",
                description:
                    "Korak-po-korak vodič za pripremu svježe tjestenine, od miješenja tijesta do savršene teksture.",
                content:
                    "U ovoj lekciji naučit ćete kako odabrati pravo brašno, pravilno mijesiti tijesto i oblikovati tjesteninu.",
                videoUrl: "https://www.youtube.com/watch?v=EnXb1u9UoBU",
                published: true,
                createdAt: new Date("2024-01-12"),
                steps: [
                    "Pomiješajte brašno i jaja dok se ne formira čvrsto tijesto.",
                    "Tijesto mijesite 8-10 minuta dok ne postane glatko.",
                    "Ostavite tijesto da odmori najmanje 30 minuta u hladnjaku.",
                    "Razvaljajte tijesto i oblikujte željeni tip tjestenine.",
                    "Kuhajte u kipućoj vodi 2-3 minute dok ne bude al dente."
                ],
                ingredients: [
                    {name: "Glatko brašno (tip 00)", amount: "300 g"},
                    {name: "Jaja", amount: "3 velika"},
                    {name: "Maslinovo ulje", amount: "1 žlica"},
                    {name: "Sol", amount: "1 prstohvat"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "320 kcal po porciji"},
                    {label: "Ugljikohidrati", value: "54 g"},
                    {label: "Bjelančevine", value: "13 g"},
                    {label: "Masti", value: "6 g"}
                ],
                quiz: {
                    id: "quiz-1",
                    title: "Provjera znanja: Svježa tjestenina",
                    description: "Provjerite koliko ste naučili o pripremi svježe tjestenine.",
                    createdAt: new Date("2024-01-12"),
                    questions: [
                        {
                            id: "question-1",
                            text: "Koje je optimalno vrijeme odmaranja tijesta prije oblikovanja?",
                            options: ["5 minuta", "15 minuta", "30 minuta", "1 sat"],
                            correctAnswer: 2
                        },
                        {
                            id: "question-2",
                            text: "Koje brašno daje najbolju elastičnost svježoj tjestenini?",
                            options: ["Tip 400", "Semolina", "Integralno brašno", "Heljdino brašno"],
                            correctAnswer: 1
                        },
                        {
                            id: "question-3",
                            text: "Što je ključ za sprječavanje lijepljenja svježe tjestenine?",
                            options: [
                                "Korištenje dosta ulja",
                                "Dodavanje šećera u tijesto",
                                "Obilno posipanje brašnom",
                                "Korištenje hladne vode"
                            ],
                            correctAnswer: 2
                        }
                    ]
                }
            },
            {
                id: "lesson-2",
                title: "Savršeni domaći pesto",
                description:
                    "Naučite napraviti aromatični pesto koristeći tradicionalnu tehniku uz tučak i mužar.",
                content:
                    "Prikazujemo kako odabrati svježe začinsko bilje, orašaste plodove te postići savršenu teksturu pesta.",
                videoUrl: "https://www.youtube.com/watch?v=4aZr5hZXP_s",
                published: true,
                createdAt: new Date("2024-02-03"),
                steps: [
                    "Pripremite svježi bosiljak, pinjole, češnjak, parmezan i maslinovo ulje.",
                    "Lagano tostirajte pinjole na tavi kako bi razvili aromu.",
                    "Koristite tučak i mužar za usitnjavanje sastojaka redoslijedom: češnjak, sol, bosiljak, pinjoli.",
                    "Dodajte naribani parmezan i postupno ulijevajte maslinovo ulje uz miješanje.",
                    "Pesto poslužite odmah ili spremite u hladnjak uz sloj maslinova ulja."
                ],
                ingredients: [
                    {name: "Svježi bosiljak", amount: "2 šalice listova"},
                    {name: "Pinjoli", amount: "40 g"},
                    {name: "Češnjak", amount: "2 češnja"},
                    {name: "Parmezan", amount: "50 g naribanog"},
                    {name: "Ekstra djevičansko maslinovo ulje", amount: "80 ml"},
                    {name: "Morska sol", amount: "po ukusu"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "90 kcal po žlici"},
                    {label: "Ugljikohidrati", value: "2 g"},
                    {label: "Bjelančevine", value: "2 g"},
                    {label: "Masti", value: "9 g"},
                    {label: "Vlakna", value: "1 g"}
                ],
                quiz: {
                    id: "quiz-2",
                    title: "Provjera znanja: Pesto",
                    description: "Koliko dobro poznajete tajne savršenog pesta?",
                    createdAt: new Date("2024-02-03"),
                    questions: [
                        {
                            id: "question-4",
                            text: "Koji sir se tradicionalno koristi u pestu alla genovese?",
                            options: ["Gouda", "Parmezan", "Cheddar", "Gauda"],
                            correctAnswer: 1
                        },
                        {
                            id: "question-5",
                            text: "Koja metoda čuva najviše arome u pestu?",
                            options: [
                                "Blendanje na visokoj brzini",
                                "Korištenje tučka i mužara",
                                "Dodavanje šećera",
                                "Zamrzavanje sastojaka prije pripreme"
                            ],
                            correctAnswer: 1
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "course-2",
        title: "Azijski street food kod kuće",
        description:
            "Rekreirajte popularna ulična jela iz cijele Azije koristeći lokalno dostupne sastojke.",
        instructorId: "instructor-2",
        instructorName: "Marko Li",
        createdAt: new Date("2024-03-10"),
        lessons: [
            {
                id: "lesson-3",
                title: "Pho juha u 30 minuta",
                description: "Skraćena verzija tradicionalne vijetnamske juhe s bogatim umamijem.",
                content:
                    "Otkrivamo kako slojevito graditi okus juhe koristeći začine, meso i svježe dodatke.",
                videoUrl: "https://www.youtube.com/watch?v=WSWwYeEuSLg",
                published: true,
                createdAt: new Date("2024-03-10"),
                steps: [
                    "Pripremite začine: zvjezdasti anis, klinčiće, cimet, korijander i kardamom.",
                    "U tavi kratko tostirajte začine kako bi otpustili aromu.",
                    "U loncu prokuhajte temeljac i dodajte pržene začine te luk i đumbir.",
                    "Dodajte proteine po izboru (govedina, piletina) i kuhajte do željene mekoće.",
                    "Poslužite s rižinim rezancima, svježim začinskim biljem i limetom."
                ],
                ingredients: [
                    {name: "Goveđi ili pileći temeljac", amount: "1,5 l"},
                    {name: "Rižini rezanci", amount: "200 g"},
                    {name: "Zvjezdasti anis", amount: "2 komada"},
                    {name: "Klinčići", amount: "4 komada"},
                    {name: "Cimet štapić", amount: "1 komad"},
                    {name: "Đumbir", amount: "4 kriške"},
                    {name: "Luk", amount: "1 veći"},
                    {name: "Proteini po izboru", amount: "300 g"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "410 kcal po porciji"},
                    {label: "Ugljikohidrati", value: "45 g"},
                    {label: "Bjelančevine", value: "28 g"},
                    {label: "Masti", value: "12 g"},
                    {label: "Natrij", value: "980 mg"}
                ],
                quiz: {
                    id: "quiz-3",
                    title: "Provjera znanja: Pho",
                    description: "Provjerite znanje o ključnim sastojcima Pho juhe.",
                    createdAt: new Date("2024-03-10"),
                    questions: [
                        {
                            id: "question-6",
                            text: "Koji začin daje Pho juhi prepoznatljiv miris?",
                            options: ["Zvjezdasti anis", "Šafran", "Kardamom", "Kurkuma"],
                            correctAnswer: 0
                        },
                        {
                            id: "question-7",
                            text: "Koja vrsta rezanaca se koristi u Pho juhi?",
                            options: [
                                "Pšenični rezanci",
                                "Rižini rezanci",
                                "Udon rezanci",
                                "Soba rezanci"
                            ],
                            correctAnswer: 1
                        }
                    ]
                }
            },
            {
                id: "lesson-4",
                title: "Japanske gyoze",
                description: "Savršeno hrskavi i sočni ravioli punjeni svinjetinom i povrćem.",
                content:
                    "U ovoj lekciji učimo bračno tijesto, punjenje i tehniku pečenja/kuhanja gyoza.",
                videoUrl: "https://www.youtube.com/watch?v=VoTqzjg83u8",
                published: true,
                createdAt: new Date("2024-03-22"),
                steps: [
                    "Pomiješajte sastojke za tijesto i ostavite da odmori 20 minuta.",
                    "Pripremite nadjev od mljevenog mesa, kupusa, đumbira i sojinog umaka.",
                    "Razvaljajte tijesto i izrežite krugove promjera oko 8 cm.",
                    "Punite gyoze i preklopite ih u oblik polumjeseca uz naborane rubove.",
                    "Pržite na tavi do zlatne boje, zatim dodajte vodu i poklopite da se ispare."
                ],
                ingredients: [
                    {name: "Pšenično brašno", amount: "250 g"},
                    {name: "Voda", amount: "140 ml"},
                    {name: "Mljevena svinjetina", amount: "200 g"},
                    {name: "Narezani kineski kupus", amount: "150 g"},
                    {name: "Sojin umak", amount: "2 žlice"},
                    {name: "Svježi đumbir", amount: "1 žlica naribanog"},
                    {name: "Sezamovo ulje", amount: "1 žličica"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "280 kcal po porciji (5 gyoza)"},
                    {label: "Ugljikohidrati", value: "30 g"},
                    {label: "Bjelančevine", value: "12 g"},
                    {label: "Masti", value: "12 g"},
                    {label: "Natrij", value: "540 mg"}
                ]
            }
        ]
    },
    {
        id: "course-3",
        title: "Plant-based specijaliteti",
        description:
            "Ukusna jela na biljnoj bazi koja impresioniraju i najtvrdokornije mesojede.",
        instructorId: "instructor-3",
        instructorName: "Ivana Horvat",
        createdAt: new Date("2024-04-05"),
        lessons: [
            {
                id: "lesson-5",
                title: "Burger od leće",
                description: "Sočni burger od crvene leće i dimljenih začina.",
                content:
                    "Kroz lekciju prolazimo pripremu leće, vezivanje smjese i pečenje.",
                videoUrl: "https://www.youtube.com/watch?v=oK8doU7-KTw",
                published: true,
                createdAt: new Date("2024-04-05"),
                steps: [
                    "Sameljite kuhanu crvenu leću i povrće u multipraktiku.",
                    "Dodajte lanene sjemenke, začine i krušne mrvice za vezivanje.",
                    "Oblikujte burgere i kratko ih ohladite u hladnjaku.",
                    "Pecite na tavi ili roštilju 3-4 minute sa svake strane.",
                    "Poslužite u pecivu s omiljenim prilozima i umacima."
                ],
                ingredients: [
                    {name: "Kuhana crvena leća", amount: "300 g"},
                    {name: "Sitno sjeckani luk", amount: "1 manji"},
                    {name: "Naribana mrkva", amount: "1 srednja"},
                    {name: "Lanene sjemenke", amount: "2 žlice mljevenih"},
                    {name: "Krušne mrvice", amount: "60 g"},
                    {name: "Dimljena paprika", amount: "1 žličica"},
                    {name: "Sol i papar", amount: "po ukusu"},
                    {name: "Maslinovo ulje", amount: "2 žlice"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "260 kcal po burgeru"},
                    {label: "Ugljikohidrati", value: "28 g"},
                    {label: "Bjelančevine", value: "12 g"},
                    {label: "Masti", value: "9 g"},
                    {label: "Vlakna", value: "8 g"}
                ],
                quiz: {
                    id: "quiz-4",
                    title: "Provjera znanja: Burger od leće",
                    description: "Testirajte znanje o pripremi burgera od leće.",
                    createdAt: new Date("2024-04-05"),
                    questions: [
                        {
                            id: "question-8",
                            text: "Koji sastojak pomaže vezati smjesu za burger?",
                            options: ["Lanene sjemenke", "Šećer", "Maslac", "Sojino mlijeko"],
                            correctAnswer: 0
                        }
                    ]
                }
            }
        ]
    }
];

type LessonWithCourse = {
    lesson: Lesson;
    course: Course;
};

const useLessonCards = (courses: Course[]): LessonWithCourse[] =>
    useMemo(
        () => courses.flatMap((course) => course.lessons.map((lesson) => ({lesson, course}))),
        [courses]
    );

const truncate = (text: string, length = 140) =>
    text.length > length ? `${text.slice(0, length).trim()}…` : text;

const getYoutubeThumbnail = (url?: string) => {
    if (!url) {
        return "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
    }

    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.replace("/", "");
            if (id) {
                return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
        }

        if (parsed.pathname.startsWith("/embed/")) {
            const id = parsed.pathname.split("/").pop();
            if (id) {
                return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
        }

        const videoId = parsed.searchParams.get("v");
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
    } catch (error) {
        console.warn("Nevažeći URL videa:", url, error);
    }

    return "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
};

const getYoutubeEmbedUrl = (url: string) => {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${id}`;
        }

        if (parsed.pathname.startsWith("/embed/")) {
            return url;
        }

        const videoId = parsed.searchParams.get("v");
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (error) {
        console.warn("Nevažeći URL videa za embed:", url, error);
    }

    return "https://www.youtube.com/embed/dQw4w9WgXcQ";
};

const formatDisplayDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }
    return date.toLocaleString("hr-HR", {
        dateStyle: "short",
        timeStyle: "short"
    });
};

export default function VideoLectures() {
    const {data: session} = useSession();
    const {
        markLessonStarted,
        hasStartedLesson,
        addReview,
        respondToReview,
        addQuestion,
        addAnswer,
        loadLessonReviews,
        loadLessonQuestions,
        getLessonReviews,
        getLessonQuestions,
        getAverageRating,
        getReviewCount,
        getUserReview
    } = useLessonFeedback();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // F-015: Pretraga i filtriranje
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState<string>("");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [selectedDietaryTag, setSelectedDietaryTag] = useState<string>("");
    const [selectedAllergen, setSelectedAllergen] = useState<string>("");
    const [minRating, setMinRating] = useState<number | null>(null);
    const [maxDuration, setMaxDuration] = useState<number | null>(null);
    
    // Instructor review dialog
    const [instructorReviewOpen, setInstructorReviewOpen] = useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
    const [selectedInstructorName, setSelectedInstructorName] = useState<string>("");

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/courses");
            if (!response.ok) {
                throw new Error("Greška pri učitavanju kurseva");
            }
            const data = await response.json();
            // Ako API vraća prazan array ili nema podataka, koristi mock podatke
            if (Array.isArray(data) && data.length === 0) {
                console.log("Baza podataka je prazna, koristim mock podatke");
                setCourses(mockCourses);
            } else {
                setCourses(data);
            }
        } catch (err) {
            console.error("Error loading courses:", err);
            setError(err instanceof Error ? err.message : "Greška pri učitavanju kurseva");
            // Fallback na mock podatke ako API ne radi
            setCourses(mockCourses);
        } finally {
            setLoading(false);
        }
    };

    // Učitaj kurseve iz API-ja
    useEffect(() => {
        
        loadCourses();
    }, []);

    const allLessons = useLessonCards(courses);
    
    // F-015: Filtriranje lekcija
    const filteredLessons = useMemo(() => {
        return allLessons.filter(({lesson, course}) => {
            // Pretraga po naslovu, opisu i sastojcima
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = lesson.title.toLowerCase().includes(query);
                const matchesDescription = lesson.description?.toLowerCase().includes(query) ?? false;
                const matchesIngredients = lesson.ingredients?.some(ing => 
                    ing.name?.toLowerCase().includes(query)
                ) ?? false;
                
                if (!matchesTitle && !matchesDescription && !matchesIngredients) {
                    return false;
                }
            }
            
            // Filtriranje po kuhinji
            if (selectedCuisine && lesson.cuisine !== selectedCuisine) {
                return false;
            }
            
            // Filtriranje po razini težine
            if (selectedDifficulty && lesson.difficultyLevel !== selectedDifficulty) {
                return false;
            }
            
            // Filtriranje po prehrambenim planovima
            if (selectedDietaryTag) {
                const dietaryTags = lesson.dietaryTags || [];
                if (!dietaryTags.includes(selectedDietaryTag)) {
                    return false;
                }
            }
            
            // Filtriranje po alergenima (isključi lekcije koje sadrže odabrani alergen)
            if (selectedAllergen) {
                const allergens = lesson.allergens || [];
                if (allergens.includes(selectedAllergen)) {
                    return false;
                }
            }
            
            // Filtriranje po minimalnoj ocjeni
            if (minRating !== null) {
                const avgRating = getAverageRating(course.id, lesson.id);
                if (!avgRating || avgRating < minRating) {
                    return false;
                }
            }
            
            // Filtriranje po maksimalnom trajanju
            if (maxDuration !== null && lesson.duration && lesson.duration > maxDuration) {
                return false;
            }
            
            return true;
        });
    }, [allLessons, searchQuery, selectedCuisine, selectedDifficulty, selectedDietaryTag, selectedAllergen, minRating, maxDuration, getAverageRating]);
    
    // Dobij jedinstvene vrijednosti za filtere
    const availableCuisines = useMemo(() => {
        const cuisines = new Set<string>();
        allLessons.forEach(({lesson}) => {
            if (lesson.cuisine) cuisines.add(lesson.cuisine);
        });
        return Array.from(cuisines).sort();
    }, [allLessons]);
    
    const availableDifficulties = useMemo(() => {
        const difficulties = new Set<string>();
        allLessons.forEach(({lesson}) => {
            if (lesson.difficultyLevel) difficulties.add(lesson.difficultyLevel);
        });
        return Array.from(difficulties).sort();
    }, [allLessons]);
    
    const availableDietaryTags = useMemo(() => {
        const tags = new Set<string>();
        allLessons.forEach(({lesson}) => {
            if (lesson.dietaryTags && Array.isArray(lesson.dietaryTags)) {
                lesson.dietaryTags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [allLessons]);
    
    const availableAllergens = useMemo(() => {
        const allergens = new Set<string>();
        allLessons.forEach(({lesson}) => {
            if (lesson.allergens && Array.isArray(lesson.allergens)) {
                lesson.allergens.forEach(allergen => allergens.add(allergen));
            }
        });
        return Array.from(allergens).sort();
    }, [allLessons]);

    const [selectedLesson, setSelectedLesson] = useState<LessonWithCourse | null>(null);
    const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState<"ingredients" | "nutrition">("ingredients");
    const [reviewRating, setReviewRating] = useState<number | null>(null);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
    const [questionText, setQuestionText] = useState("");
    const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
    const [reviewResponseDrafts, setReviewResponseDrafts] = useState<Record<string, string>>({});

    const selectedCourseId = selectedLesson?.course.id;
    const selectedLessonId = selectedLesson?.lesson.id;
    const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMINISTRATOR";

    const lessonReviews = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getLessonReviews(selectedCourseId, selectedLessonId)
                : [],
        [getLessonReviews, selectedCourseId, selectedLessonId]
    );

    const lessonQuestions = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getLessonQuestions(selectedCourseId, selectedLessonId)
                : [],
        [getLessonQuestions, selectedCourseId, selectedLessonId]
    );

    const averageRating = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getAverageRating(selectedCourseId, selectedLessonId)
                : null,
        [getAverageRating, selectedCourseId, selectedLessonId]
    );

    const reviewCount = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getReviewCount(selectedCourseId, selectedLessonId)
                : 0,
        [getReviewCount, selectedCourseId, selectedLessonId]
    );

    const userReview = useMemo(
        () =>
            selectedCourseId && selectedLessonId && session?.user?.id
                ? getUserReview(selectedCourseId, selectedLessonId, session.user.id)
                : undefined,
        [session?.user?.id, getUserReview, selectedCourseId, selectedLessonId]
    );

    const lessonStarted = selectedLessonId ? hasStartedLesson(selectedLessonId) : false;

    const selectedIngredients = selectedLesson?.lesson.ingredients ?? [];
    const selectedNutrition = selectedLesson?.lesson.nutrition ?? [];
    const hasIngredients = selectedIngredients.length > 0;
    const hasNutrition = selectedNutrition.length > 0;

    const handleOpenLesson = async (entry: LessonWithCourse) => {
        setSelectedLesson(entry);
        if (entry.lesson.ingredients?.length) {
            setActiveInfoTab("ingredients");
        } else if (entry.lesson.nutrition?.length) {
            setActiveInfoTab("nutrition");
        } else {
            setActiveInfoTab("ingredients");
        }
        setReviewRating(null);
        setReviewComment("");
        setReviewPhoto(null);
        setQuestionText("");
        setAnswerDrafts({});
        setReviewResponseDrafts({});
        setLessonDialogOpen(true);

        // Učitaj recenzije i pitanja za lekciju
        if (entry.course.id && entry.lesson.id) {
            await Promise.all([
                loadLessonReviews(entry.course.id, entry.lesson.id),
                loadLessonQuestions(entry.course.id, entry.lesson.id)
            ]);
        }
    };

    const handleCloseLesson = () => {
        setLessonDialogOpen(false);
        setSelectedLesson(null);
        setActiveInfoTab("ingredients");
        setReviewRating(null);
        setReviewComment("");
        setReviewPhoto(null);
        setQuestionText("");
        setAnswerDrafts({});
        setReviewResponseDrafts({});
    };

    const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedLesson || reviewRating === null || userReview || !session?.user?.id) {
            return;
        }

        try {
            await addReview({
                courseId: selectedLesson.course.id,
                lessonId: selectedLesson.lesson.id,
                rating: reviewRating,
                comment: reviewComment.trim() || undefined,
                photoDataUrl: reviewPhoto ?? undefined,
            });

            setReviewRating(null);
            setReviewComment("");
            setReviewPhoto(null);
        } catch (error) {
            console.error("Error submitting review:", error);
            // Error handling može biti dodan ovdje
        }
    };

    const handleReviewPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setReviewPhoto(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setReviewPhoto(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedLesson || !questionText.trim() || !session?.user?.id) {
            return;
        }

        try {
            await addQuestion({
                courseId: selectedLesson.course.id,
                lessonId: selectedLesson.lesson.id,
                question: questionText.trim(),
            });

            setQuestionText("");
        } catch (error) {
            console.error("Error submitting question:", error);
            // Error handling može biti dodan ovdje
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswerDrafts(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleAnswerSubmit = async (questionId: string) => {
        if (!selectedLesson) {
            return;
        }
        const message = answerDrafts[questionId]?.trim();
        if (!message) {
            return;
        }

        try {
            await addAnswer({
                questionId,
                message
            });

            setAnswerDrafts(prev => ({
                ...prev,
                [questionId]: ""
            }));
        } catch (error) {
            console.error("Error submitting answer:", error);
            // Error handling može biti dodan ovdje
        }
    };

    const handleReviewResponseChange = (reviewId: string, value: string) => {
        setReviewResponseDrafts(prev => ({
            ...prev,
            [reviewId]: value
        }));
    };

    const handleReviewResponseSubmit = async (reviewId: string) => {
        if (!selectedLesson) {
            return;
        }
        const message = reviewResponseDrafts[reviewId]?.trim();
        if (!message) {
            return;
        }

        try {
            await respondToReview({
                reviewId,
                message
            });

            setReviewResponseDrafts(prev => ({
                ...prev,
                [reviewId]: ""
            }));
        } catch (error) {
            console.error("Error responding to review:", error);
            // Error handling može biti dodan ovdje
        }
    };

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateCourse = async () => {
        if (!title.trim()) {
            alert("Naziv kursa je obavezan");
            return;
        }

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,

                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Greška");
            }
            //reset sve
            setTitle("");
            setDescription("");
            setOpen(false);
            //loadaj sve opet
            loadCourses();

        } catch (err:any) {
            alert(err.message);
        }
    }

    type Ingredient = {
        name: string;
        amount: string;
    }

    type Nutrition = {
        label: string;
        value: string;
    }

    const [openLessonCreate, setOpenLessonCreate] = useState(false);
    const [lessonCreateLoading, setLessonCreateLoading] = useState(false);
    const [lessonCreateTitle, setLessonCreateTitle] = useState("");
    const [lessonCreateDescription, setLessonCreateDescription] = useState("");
    const [lessonContent, setLessonContent] = useState("");
    const [courseId, setCourseId] = useState("");
    const [lessonVideoUrl, setLessonVideoUrl] = useState("");
    const [lessonPublished, setLessonPublished] = useState(false);
    const [lessonSteps, setLessonSteps] = useState<string[]>([""]);
    const [lessonIngredients, setLessonIngredients] = useState<Ingredient[]>([{name:"", amount:""}]);
    const [lessonNutrition, setLessonNutrition] = useState<Nutrition[]>([{label:"", value:""}]);

    const handleCreateLesson = async () => {
        if (!lessonCreateTitle.trim() || !courseId) {
            alert("Naziv lekcije i kurs su obavezni");
            return;
        }

        setLessonCreateLoading(true);

        try {
            const res = await fetch("/api/lessons", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    title: lessonCreateTitle,
                    description: lessonCreateDescription,
                    courseId: courseId,
                    videoUrl: lessonVideoUrl,
                    published: lessonPublished,
                    steps: lessonSteps,
                    ingredients: lessonIngredients,
                    nutrition: lessonNutrition
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Greška"); 
            }
            
            //reset sve
            setLessonCreateTitle("");
            setLessonCreateDescription("");
            setLessonContent("");
            setCourseId("")
            setLessonVideoUrl("");
            setLessonPublished(false);
            setLessonSteps([""]);
            setLessonIngredients([{name:"", amount:""}]);
            setLessonNutrition([{label:"", value:""}]);
            setOpenLessonCreate(false);
            //loadaj sve opet
            loadCourses()

        } catch (err:any) {
            alert (err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
    ) => {
        setter(prev => prev.map((v, i) => (i === index ? value : v)));
    };

    const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
    ) => {
        setLessonIngredients(prev =>
            prev.map((ing, i) =>
            i === index ? { ...ing, [field]: value } : ing
            )
        );
    };   

    const updateNutrition = (
    index: number,
    field: keyof Nutrition,
    value: string
    ) => {
        setLessonNutrition(prev =>
            prev.map((nut, i) =>
            i === index ? { ...nut, [field]: value } : nut
            )
        );
    };
    

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Video lekcije i kvizovi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                Pregledajte lekcije i provjerite znanje na kraju svake lekcije kroz kviz.
            </Typography>

            {isInstructor && (
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Novi kurs
                </Button>
            )}

            <Dialog open = {open} onClose = {() => setOpen(false)} fullWidth maxWidth = "sm">
                <DialogTitle> Napravi novi kurs </DialogTitle>
                <DialogContent>
                    <Stack spacing = {2} mt = {1}>
                        <TextField 
                            label = "Naziv kursa"
                            value = {title}
                            onChange = {(e) => setTitle(e.target.value)} 
                            required
                            autoFocus
                        />
                        <TextField
                            label="Opis"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                        />
                        
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateCourse}
                        variant="contained"
                        disabled={loading}
                    >
                    {loading ? "Creating..." : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {isInstructor && (
                <Button variant="contained" onClick={() => setOpenLessonCreate(true)}>
                    Nova lekcija
                </Button>
            )}
                <Dialog open = {openLessonCreate} onClose = {() => setOpen(false)} fullWidth maxWidth = "sm">
                    <DialogTitle>Kreiraj novu lekciju</DialogTitle>
                    <DialogContent>
                        <Stack spacing = {2} mt = {1}>
                            <TextField 
                                label = "Naziv lekcije"
                                value = {lessonCreateTitle}
                                onChange = {(e) => setLessonCreateTitle(e.target.value)}
                                required
                            />
                            <TextField 
                                label = "Opis"
                                value = {lessonCreateDescription}
                                onChange = {(e) => setLessonCreateDescription(e.target.value)}
                                required  
                            />

                            <TextField 
                                label = "Sadržaj"
                                value = {lessonContent}
                                onChange = {(e) => setLessonContent(e.target.value)}
                                required  
                            />
                            <FormControl required>
                                <InputLabel id="course-select-label">
                                    Course
                                </InputLabel>
                                <Select
                                    labelId="course-select-label"
                                    value={courseId}
                                    label="Course"
                                    onChange={(e) => setCourseId(e.target.value)}
                                    >
                                    {courses.map((course) => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.title}
                                    </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField 
                                label = "Video url"
                                value = {lessonVideoUrl}
                                onChange = {(e) => setLessonVideoUrl(e.target.value)}
                                required  
                            />

                            {lessonSteps.map((step, i) => (
                                <TextField
                                    key={`step-${i}`}
                                    label={`Korak ${i + 1}`}
                                    value={step}
                                    onChange={(e) =>
                                    updateArrayItem(setLessonSteps, i, e.target.value)
                                    }
                                    />
                            ))}
                            <Button
                            onClick={() => setLessonSteps(prev => [...prev, ""])}
                            >
                            Dodaj korak
                            </Button>
                            {lessonIngredients.map((ingredient, i) => (
                               <Stack key={`ingredient-${i}`} direction="row" spacing={1}>
                                    <TextField 
                                        label = "Naziv"
                                        value = {ingredient.name}
                                        onChange = {(e) => updateIngredient(i, "name", e.target.value)}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Količina"
                                        value={ingredient.amount}
                                        onChange={(e) =>
                                            updateIngredient(i, "amount", e.target.value)
                                        }
                                        fullWidth
                                    />
                                </Stack>
                            ))}
                            <Button
                            onClick={() => setLessonIngredients(prev => [...prev, {name: "", amount: ""}])}
                            >
                            Dodaj sastojak
                            </Button>
                            {lessonNutrition.map((nutrition, i) => (
                                <Stack key={`nutrition-${i}`} direction="row" spacing={1}>
                                    <TextField 
                                        label = "Naziv"
                                        value = {nutrition.label}
                                        onChange = {(e) => updateNutrition(i, "label", e.target.value)}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Vrijednost"
                                        value={nutrition.value}
                                        onChange={(e) =>
                                            updateNutrition(i, "value", e.target.value)
                                        }
                                        fullWidth
                                    />
                                </Stack>
                            ))}
                            <Button
                            onClick={() => setLessonNutrition(prev => [...prev, {label:"", value: ""}])}
                            >
                            Dodaj nutriciju
                            </Button>
                            <FormControlLabel 
                                control = {
                                    <Checkbox
                                    checked = {lessonPublished}
                                    onChange = {(e) => setLessonPublished(e.target.checked)}
                                    color = "primary"
                                    />
                                }
                                label = "Objavi"
                            />

                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLessonCreate(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateLesson}
                            disabled={loading}
                        >
                        {loading ? "Creating..." : "Create"}
                        </Button>
                    </DialogActions>
                </Dialog>

            {loading && (
                <Box sx={{display: "flex", justifyContent: "center", p: 4}}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {/* F-015: Pretraga i filtriranje UI */}
            {!loading && (
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography variant="h6" gutterBottom>
                        <FilterListIcon sx={{verticalAlign: "middle", mr: 1}} />
                        Pretraga i filtriranje
                    </Typography>
                    <Stack spacing={2}>
                        <Box sx={{display: "flex", gap: 2, flexWrap: "wrap"}}>
                            <TextField
                                sx={{flex: "1 1 300px", minWidth: 250}}
                                placeholder="Pretraži po naslovu, opisu ili sastojcima..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormControl sx={{minWidth: 150}}>
                                <InputLabel>Kuhinja</InputLabel>
                                <Select
                                    value={selectedCuisine}
                                    onChange={(e: SelectChangeEvent) => setSelectedCuisine(e.target.value)}
                                    label="Kuhinja"
                                >
                                    <MenuItem value="">Sve</MenuItem>
                                    {availableCuisines.map(cuisine => (
                                        <MenuItem key={cuisine} value={cuisine}>{cuisine}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{minWidth: 150}}>
                                <InputLabel>Težina</InputLabel>
                                <Select
                                    value={selectedDifficulty}
                                    onChange={(e: SelectChangeEvent) => setSelectedDifficulty(e.target.value)}
                                    label="Težina"
                                >
                                    <MenuItem value="">Sve</MenuItem>
                                    {availableDifficulties.map(difficulty => (
                                        <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{minWidth: 150}}>
                                <InputLabel>Prehrambeni plan</InputLabel>
                                <Select
                                    value={selectedDietaryTag}
                                    onChange={(e: SelectChangeEvent) => setSelectedDietaryTag(e.target.value)}
                                    label="Prehrambeni plan"
                                >
                                    <MenuItem value="">Sve</MenuItem>
                                    {availableDietaryTags.map(tag => (
                                        <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{minWidth: 150}}>
                                <InputLabel>Isključi alergen</InputLabel>
                                <Select
                                    value={selectedAllergen}
                                    onChange={(e: SelectChangeEvent) => setSelectedAllergen(e.target.value)}
                                    label="Isključi alergen"
                                >
                                    <MenuItem value="">Nema</MenuItem>
                                    {availableAllergens.map(allergen => (
                                        <MenuItem key={allergen} value={allergen}>{allergen}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center"}}>
                            <TextField
                                sx={{width: 180}}
                                type="number"
                                label="Minimalna ocjena"
                                value={minRating || ""}
                                onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
                                inputProps={{min: 1, max: 5, step: 0.1}}
                            />
                            <TextField
                                sx={{width: 200}}
                                type="number"
                                label="Maksimalno trajanje (min)"
                                value={maxDuration || ""}
                                onChange={(e) => setMaxDuration(e.target.value ? parseInt(e.target.value) : null)}
                                inputProps={{min: 1}}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCuisine("");
                                    setSelectedDifficulty("");
                                    setSelectedDietaryTag("");
                                    setSelectedAllergen("");
                                    setMinRating(null);
                                    setMaxDuration(null);
                                }}
                            >
                                Resetiraj filtere
                            </Button>
                            <Chip
                                label={`Pronađeno: ${filteredLessons.length} lekcija`}
                                color="primary"
                            />
                        </Box>
                    </Stack>
                </Paper>
            )}

            {!loading && (
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3
                    }}
                >
                    {filteredLessons.map(({lesson, course}) => {
                        const lessonAverage = getAverageRating(course.id, lesson.id);
                        const lessonReviewCount = getReviewCount(course.id, lesson.id);
                        return (
                            <Box
                                key={lesson.id}
                                sx={{
                                    flex: "1 1 280px",
                                    minWidth: 280,
                                    maxWidth: 380
                                }}
                            >
                                <Card className="lesson-card" sx={{height: "100%"}}>
                                    <CardActionArea onClick={() => handleOpenLesson({lesson, course})}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={
                                                lesson.videoUrl
                                                    ? getYoutubeThumbnail(lesson.videoUrl)
                                                    : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=60"
                                            }
                                            alt={lesson.title}
                                        />
                                        <CardContent className="lesson-card-content">
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
                                            >
                                                <Chip label={course.title} color="secondary" size="small" />
                                                {lesson.quiz ? (
                                                    <Chip label="Ima kviz" color="success" size="small" />
                                                ) : (
                                                    <Chip label="Bez kviza" size="small" />
                                                )}
                                                {lessonReviewCount > 0 && (
                                                    <Chip
                                                        size="small"
                                                        color="warning"
                                                        label={`⭐ ${lessonAverage?.toFixed(1)} (${lessonReviewCount})`}
                                                    />
                                                )}
                                            </Stack>

                                            <Typography variant="h6" sx={{mt: 2}} gutterBottom>
                                                {lesson.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {truncate(lesson.description)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Dialog open={isLessonDialogOpen && !!selectedLesson} onClose={handleCloseLesson} maxWidth="md" fullWidth>
                {selectedLesson && (
                    <>
                        <DialogTitle>{selectedLesson.lesson.title}</DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Instruktor: {selectedLesson.course.instructorName}
                                </Typography>
                                {session?.user?.id && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            setSelectedInstructorId(selectedLesson.course.instructorId);
                                            setSelectedInstructorName(selectedLesson.course.instructorName);
                                            setInstructorReviewOpen(true);
                                        }}
                                    >
                                        Ocijeni instruktora
                                    </Button>
                                )}
                            </Box>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb: 2}}>
                                <Rating value={averageRating ?? 0} precision={0.5} readOnly />
                                <Typography variant="body2" color="text.secondary">
                                    {reviewCount > 0 && averageRating !== null
                                        ? `${averageRating.toFixed(1)} / 5 · ${reviewCount} recenzija`
                                        : "Još nema ocjena za ovu lekciju."}
                                </Typography>
                            </Stack>
                            {!lessonStarted && (
                                <Box sx={{mb: 3}}>
                                    <Alert severity="info" sx={{mb: 1}}>
                                        Za ocjenjivanje i postavljanje pitanja označite da ste započeli lekciju instruktora{" "}
                                        {selectedLesson.course.instructorName}.
                                    </Alert>
                                    <Button variant="contained" size="small" onClick={() => markLessonStarted(selectedLesson.lesson.id)}>
                                        Označi lekciju započetom
                                    </Button>
                                </Box>
                            )}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {xs: "column", md: "row"},
                                    gap: 3
                                }}
                            >
                                <Box sx={{flex: 1}}>
                                    {selectedLesson.lesson.videoUrl && (
                                        <Box sx={{position: "relative", pt: "56.25%", borderRadius: 2, overflow: "hidden"}}>
                                            <iframe
                                                src={
                                                    selectedLesson.lesson.videoUrl
                                                        ? getYoutubeEmbedUrl(selectedLesson.lesson.videoUrl)
                                                        : undefined
                                                }
                                                title={selectedLesson.lesson.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{position: "absolute", inset: 0, width: "100%", height: "100%", border: 0}}
                                            />
                                        </Box>
                                    )}
                                    <Typography variant="body2" sx={{mt: 3}}>
                                        {selectedLesson.lesson.content}
                                    </Typography>
                                </Box>
                                <Box sx={{flex: 1, display: "flex", flexDirection: "column", gap: 3}}>
                                    {selectedLesson.lesson.steps && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Koraci pripreme
                                            </Typography>
                                            <ol className="lesson-steps">
                                                {selectedLesson.lesson.steps.map((step, index) => (
                                                    <li key={index}>
                                                        <Typography variant="body2">{step}</Typography>
                                                    </li>
                                                ))}
                                            </ol>
                                        </Box>
                                    )}
                                    {(hasIngredients || hasNutrition) && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Detalji jela
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{mb: 2}}>
                                                <Button
                                                    variant={activeInfoTab === "ingredients" ? "contained" : "outlined"}
                                                    onClick={() => setActiveInfoTab("ingredients")}
                                                    disabled={!hasIngredients}
                                                    size="small"
                                                >
                                                    Ingredients
                                                </Button>
                                                <Button
                                                    variant={activeInfoTab === "nutrition" ? "contained" : "outlined"}
                                                    onClick={() => setActiveInfoTab("nutrition")}
                                                    disabled={!hasNutrition}
                                                    size="small"
                                                >
                                                    Nutrition
                                                </Button>
                                            </Stack>
                                            {activeInfoTab === "ingredients" ? (
                                                hasIngredients ? (
                                                    <ul className="lesson-info-list">
                                                        {selectedIngredients.map((item, index) => (
                                                            <li key={index}>
                                                                <Typography variant="body2">
                                                                    <strong>{item.name}</strong>: {item.amount}
                                                                </Typography>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Podaci o sastojcima nisu dostupni za ovu lekciju.
                                                    </Typography>
                                                )
                                            ) : hasNutrition ? (
                                                <ul className="lesson-info-list">
                                                    {selectedNutrition.map((fact, index) => (
                                                        <li key={index}>
                                                            <Typography variant="body2">
                                                                <strong>{fact.label}</strong>: {fact.value}
                                                            </Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nutritivne informacije nisu dostupne za ovu lekciju.
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                            <Divider sx={{my: 3}} />
                            <Box className="lesson-feedback-section">
                                <Typography variant="h6" gutterBottom>
                                    Ocjene i komentari
                                </Typography>
                                {lessonReviews.length > 0 ? (
                                    <Stack spacing={2}>
                                        {lessonReviews.map(review => (
                                            <Paper key={review.id} variant="outlined" className="lesson-review-card" sx={{p: 2}}>
                                                <Stack
                                                    direction={{xs: "column", sm: "row"}}
                                                    spacing={1}
                                                    justifyContent="space-between"
                                                    alignItems={{xs: "flex-start", sm: "center"}}
                                                >
                                                    <Box>
                                                        <Typography variant="subtitle2">{review.userName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDisplayDate(review.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Rating value={review.rating} readOnly precision={0.5} size="small" />
                                                </Stack>
                                                {review.comment && (
                                                    <Typography variant="body2" sx={{mt: 1.5}}>
                                                        {review.comment}
                                                    </Typography>
                                                )}
                                                {review.photoDataUrl && (
                                                    <Box
                                                        component="img"
                                                        src={review.photoDataUrl}
                                                        alt={`Fotografija recenzije od ${review.userName}`}
                                                        sx={{
                                                            mt: 1.5,
                                                            width: "100%",
                                                            maxHeight: 220,
                                                            objectFit: "cover",
                                                            borderRadius: 1
                                                        }}
                                                    />
                                                )}
                                                {review.instructorResponse ? (
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            mt: 2,
                                                            p: 1.5,
                                                            bgcolor: "action.hover"
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2">
                                                            {review.responseAuthorName ?? selectedLesson.course.instructorName} (instruktor)
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {review.responseAt ? formatDisplayDate(review.responseAt) : undefined}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{mt: 0.5}}>
                                                            {review.instructorResponse}
                                                        </Typography>
                                                    </Paper>
                                                ) : (
                                                    <Box sx={{mt: 2}}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Instruktor još nije odgovorio na ovaj komentar.
                                                        </Typography>
                                                        <Stack
                                                            direction={{xs: "column", sm: "row"}}
                                                            spacing={1}
                                                            sx={{mt: 1}}
                                                            alignItems={{xs: "stretch", sm: "center"}}
                                                        >
                                                            <TextField
                                                                size="small"
                                                                label="Odgovor instruktora (demo)"
                                                                value={reviewResponseDrafts[review.id] ?? ""}
                                                                onChange={event => handleReviewResponseChange(review.id, event.target.value)}
                                                                fullWidth
                                                                multiline
                                                                minRows={1}
                                                            />
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleReviewResponseSubmit(review.id)}
                                                                disabled={!reviewResponseDrafts[review.id]?.trim()}
                                                            >
                                                                Objavi odgovor
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Još nema recenzija. Budite prvi koji će podijeliti dojam o lekciji.
                                    </Typography>
                                )}

                                {lessonStarted ? (
                                    userReview ? (
                                        <Alert severity="success" sx={{mt: 3}}>
                                            Već ste ocijenili ovu lekciju. Hvala na povratnim informacijama!
                                        </Alert>
                                    ) : (
                                        <Box
                                            component="form"
                                            onSubmit={handleReviewSubmit}
                                            sx={{mt: 3, display: "flex", flexDirection: "column", gap: 2}}
                                        >
                                            <Typography variant="subtitle2">Podijelite svoje iskustvo</Typography>
                                            <Rating
                                                value={reviewRating ?? 0}
                                                onChange={(_, value) => setReviewRating(value)}
                                                precision={0.5}
                                            />
                                            <TextField
                                                label="Komentar (opcionalno)"
                                                multiline
                                                minRows={3}
                                                value={reviewComment}
                                                onChange={event => setReviewComment(event.target.value)}
                                                placeholder="Što vam se posebno svidjelo ili gdje vidite prostor za napredak?"
                                            />
                                            <Stack
                                                direction={{xs: "column", sm: "row"}}
                                                spacing={1}
                                                alignItems={{xs: "stretch", sm: "center"}}
                                            >
                                                <Button component="label" variant="outlined" size="small">
                                                    {reviewPhoto ? "Zamijeni fotografiju" : "Dodaj fotografiju"}
                                                    <input type="file" hidden accept="image/*" onChange={handleReviewPhotoChange} />
                                                </Button>
                                                {reviewPhoto && (
                                                    <Button variant="text" color="secondary" size="small" onClick={() => setReviewPhoto(null)}>
                                                        Ukloni fotografiju
                                                    </Button>
                                                )}
                                            </Stack>
                                            {reviewPhoto && (
                                                <Box
                                                    component="img"
                                                    src={reviewPhoto}
                                                    alt="Pregled priložene fotografije"
                                                    sx={{
                                                        width: "100%",
                                                        maxHeight: 220,
                                                        objectFit: "cover",
                                                        borderRadius: 1
                                                    }}
                                                />
                                            )}
                                            <Button type="submit" variant="contained" disabled={reviewRating === null}>
                                                Spremi recenziju
                                            </Button>
                                        </Box>
                                    )
                                ) : (
                                    <Alert severity="warning" sx={{mt: 3}}>
                                        Za ostavljanje ocjene najprije označite da ste započeli lekciju.
                                    </Alert>
                                )}
                            </Box>

                            <Divider sx={{my: 3}} />
                            <Box className="lesson-feedback-section">
                                <Typography variant="h6" gutterBottom>
                                    Pitanja i odgovori
                                </Typography>
                                {lessonQuestions.length > 0 ? (
                                    <Stack spacing={2}>
                                        {lessonQuestions.map(question => (
                                            <Paper key={question.id} variant="outlined" className="lesson-question-card" sx={{p: 2}}>
                                                <Typography variant="subtitle2">{question.userName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDisplayDate(question.createdAt)}
                                                </Typography>
                                                <Typography variant="body2" sx={{mt: 1.5}}>
                                                    {question.question}
                                                </Typography>
                                                {question.answers.length > 0 ? (
                                                    <Stack spacing={1.5} sx={{mt: 2}}>
                                                        {question.answers.map(answer => (
                                                            <Paper
                                                                key={answer.id}
                                                                variant="outlined"
                                                                sx={{p: 1.5, bgcolor: "action.hover"}}
                                                            >
                                                                <Typography variant="subtitle2">
                                                                    {answer.responderName} (instruktor)
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatDisplayDate(answer.createdAt)}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{mt: 0.5}}>
                                                                    {answer.message}
                                                                </Typography>
                                                            </Paper>
                                                        ))}
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary" sx={{mt: 2, display: "block"}}>
                                                        Instruktor još nije odgovorio na ovo pitanje.
                                                    </Typography>
                                                )}
                                                {question.answers.length === 0 && (
                                                    <Stack
                                                        direction={{xs: "column", sm: "row"}}
                                                        spacing={1}
                                                        sx={{mt: 2}}
                                                        alignItems={{xs: "stretch", sm: "center"}}
                                                    >
                                                        <TextField
                                                            size="small"
                                                            label="Odgovor instruktora (demo)"
                                                            value={answerDrafts[question.id] ?? ""}
                                                            onChange={event => handleAnswerChange(question.id, event.target.value)}
                                                            fullWidth
                                                            multiline
                                                            minRows={1}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => handleAnswerSubmit(question.id)}
                                                            disabled={!answerDrafts[question.id]?.trim()}
                                                        >
                                                            Objavi odgovor
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Još nema pitanja. Postavite prvo pitanje i pomozite drugim polaznicima!
                                    </Typography>
                                )}

                                {lessonStarted ? (
                                    <Box
                                        component="form"
                                        onSubmit={handleQuestionSubmit}
                                        sx={{mt: 3, display: "flex", flexDirection: "column", gap: 2}}
                                    >
                                        <Typography variant="subtitle2">Imate pitanje za instruktora?</Typography>
                                        <TextField
                                            label="Pitanje"
                                            multiline
                                            minRows={2}
                                            value={questionText}
                                            onChange={event => setQuestionText(event.target.value)}
                                            placeholder="Npr. Koju zamjenu preporučujete za..."
                                        />
                                        <Button type="submit" variant="outlined" disabled={!questionText.trim()}>
                                            Objavi pitanje
                                        </Button>
                                    </Box>
                                ) : (
                                    <Alert severity="warning" sx={{mt: 3}}>
                                        Pitanja možete postavljati tek nakon što krenete pohađati lekciju.
                                    </Alert>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseLesson}>Zatvori</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Instructor Review Dialog */}
            <InstructorReviewDialog
                open={instructorReviewOpen}
                onClose={() => setInstructorReviewOpen(false)}
                instructorId={selectedInstructorId}
                instructorName={selectedInstructorName}
            />
        </Box>
    );
}