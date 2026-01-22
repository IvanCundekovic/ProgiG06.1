import {useCallback, useEffect, useState} from "react";
import type {
    LiveWorkshop,
    WorkshopRegistration,
    WorkshopRequirement
} from "@/app/types/quiz";

type CreateWorkshopInput = {
    title: string;
    description: string;
    scheduledAt: string;
    durationMinutes: number;
    capacity: number;
    meetingUrl: string;
    requirements: WorkshopRequirement[];
    instructorId: string;
    instructorName: string;
};

type UpdateWorkshopInput = Partial<CreateWorkshopInput> & {
    id: string;
};

type RegisterForWorkshopInput = {
    workshopId: string;
    userId: string;
    userName: string;
};

type SyncCalendarInput = {
    workshopId: string;
};

type UpdateStatusInput = {
    workshopId: string;
    status: LiveWorkshop["status"];
    connectionStatus?: LiveWorkshop["lastConnectionStatus"];
};

export function useLiveWorkshops() {
    const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
    const [registrations, setRegistrations] = useState<WorkshopRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
            try {
                setLoading(true);
                setError(null);

                // Učitaj radionice
                const workshopsResponse = await fetch("/api/workshops");
                if (!workshopsResponse.ok) {
                    throw new Error("Greška pri učitavanju radionica");
                }
                const workshopsData = await workshopsResponse.json();
                setWorkshops(workshopsData || []);

                // Učitaj registracije (ne zahtijeva autentifikaciju - vraća prazan array ako nije prijavljen)
                try {
                    const registrationsResponse = await fetch("/api/workshop-registrations");
                    if (registrationsResponse.ok) {
                        const registrationsData = await registrationsResponse.json();
                        setRegistrations(registrationsData || []);
                    } else {
                        // Ako endpoint vraća grešku, postavi prazan array
                        console.warn("Nije moguće učitati registracije, koristim prazan array");
                        setRegistrations([]);
                    }
                } catch (regErr) {
                    // Ako se dogodi greška pri učitavanju registracija, postavi prazan array
                    console.warn("Greška pri učitavanju registracija:", regErr);
                    setRegistrations([]);
                }
            } catch (err) {
                console.error("Error loading workshops:", err);
                setError(err instanceof Error ? err.message : "Greška pri učitavanju podataka");
                // Postavi prazne podatke u slučaju greške
                setWorkshops([]);
                setRegistrations([]);
            } finally {
                setLoading(false);
            }
        }, []);

    // Učitaj radionice i registracije (inicijalno)
    useEffect(() => {
        void loadData();
    }, [loadData]);

    // UC-11: Polling da se kapacitet ažurira svim korisnicima
    useEffect(() => {
        const interval = setInterval(() => {
            void loadData();
        }, 10000);

        return () => clearInterval(interval);
    }, [loadData]);

    const createWorkshop = useCallback(
        async ({
            title,
            description,
            scheduledAt,
            durationMinutes,
            capacity,
            meetingUrl,
            requirements,
        }: Omit<CreateWorkshopInput, "instructorId" | "instructorName">) => {
            try {
                const response = await fetch("/api/workshops", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        scheduledAt,
                        durationMinutes,
                        capacity,
                        meetingUrl,
                        requirements,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri kreiranju radionice");
                }

                const newWorkshop = await response.json();
                setWorkshops(prev => [...prev, newWorkshop]);
                return newWorkshop;
            } catch (err) {
                console.error("Error creating workshop:", err);
                throw err;
            }
        },
        []
    );

    const updateWorkshop = useCallback(
        async ({id, ...updates}: UpdateWorkshopInput) => {
            try {
                const response = await fetch(`/api/workshops/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updates),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri ažuriranju radionice");
                }

                const updatedWorkshop = await response.json();
                setWorkshops(prev =>
                    prev.map(workshop => (workshop.id === id ? updatedWorkshop : workshop))
                );

                // Ako je promijenjen termin, osvježi registracije
                if (updates.scheduledAt) {
                    const registrationsResponse = await fetch(`/api/workshop-registrations?workshopId=${id}`);
                    if (registrationsResponse.ok) {
                        const registrationsData = await registrationsResponse.json();
                        setRegistrations(prev =>
                            prev.map(reg =>
                                reg.workshopId === id
                                    ? registrationsData.find((r: WorkshopRegistration) => r.id === reg.id) || reg
                                    : reg
                            )
                        );
                    }
                }

                return updatedWorkshop;
            } catch (err) {
                console.error("Error updating workshop:", err);
                throw err;
            }
        },
        []
    );

    const updateWorkshopStatus = useCallback(
        async ({workshopId, status, connectionStatus}: UpdateStatusInput) => {
            try {
                const response = await fetch(`/api/workshops/${workshopId}/status`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status,
                        connectionStatus,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri ažuriranju statusa");
                }

                const updatedWorkshop = await response.json();
                setWorkshops(prev =>
                    prev.map(workshop =>
                        workshop.id === workshopId ? updatedWorkshop : workshop
                    )
                );

                // Ako je status promijenjen, osvježi registracije
                if (status === "in_progress" || status === "completed" || connectionStatus === "reconnecting") {
                    const registrationsResponse = await fetch(`/api/workshop-registrations?workshopId=${workshopId}`);
                    if (registrationsResponse.ok) {
                        const registrationsData = await registrationsResponse.json();
                        setRegistrations(prev =>
                            prev.map(reg =>
                                reg.workshopId === workshopId
                                    ? registrationsData.find((r: WorkshopRegistration) => r.id === reg.id) || reg
                                    : reg
                            )
                        );
                    }
                }

                return updatedWorkshop;
            } catch (err) {
                console.error("Error updating workshop status:", err);
                throw err;
            }
        },
        []
    );

    const registerForWorkshop = useCallback(
        async ({workshopId}: Omit<RegisterForWorkshopInput, "userId" | "userName">) => {
            try {
                const response = await fetch("/api/workshop-registrations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        workshopId,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri prijavi na radionicu");
                }

                const newRegistration = await response.json();
                setRegistrations(prev => [...prev, newRegistration]);
                // Osvježi radionice da se kapacitet odmah ažurira
                await loadData();
                return newRegistration;
            } catch (err) {
                console.error("Error registering for workshop:", err);
                throw err;
            }
        },
        [loadData]
    );

    const syncCalendar = useCallback(
        async ({workshopId}: SyncCalendarInput) => {
            try {
                // Google Calendar sync se implementira kroz GoogleCalendarSettings model u bazi
                // Za potpunu integraciju potrebno je implementirati Google Calendar API pozive
                // Za sada samo simulacija
                const workshop = workshops.find(w => w.id === workshopId);
                if (workshop) {
                    const updatedWorkshop = {
                        ...workshop,
                        calendarSyncedAt: new Date().toISOString(),
                    };
                    setWorkshops(prev =>
                        prev.map(w => (w.id === workshopId ? updatedWorkshop : w))
                    );
                }
            } catch (err) {
                console.error("Error syncing calendar:", err);
                throw err;
            }
        },
        [workshops]
    );

    const getWorkshopById = useCallback(
        (id: string) => workshops.find(workshop => workshop.id === id),
        [workshops]
    );

    const getRegistrationsForWorkshop = useCallback(
        (workshopId: string) => registrations.filter(reg => reg.workshopId === workshopId),
        [registrations]
    );

    const getUserRegistration = useCallback(
        (workshopId: string, userId: string) =>
            registrations.find(
                registration => registration.workshopId === workshopId && registration.userId === userId
            ),
        [registrations]
    );

    const clearNotifications = useCallback(
        async (registrationId: string) => {
            try {
                const response = await fetch(
                    `/api/workshop-registrations/${registrationId}/notifications/clear`,
                    {
                        method: "PUT",
                    }
                );

                if (!response.ok) {
                    throw new Error("Greška pri brisanju notifikacija");
                }

                // Osvježi registracije
                const registrationsResponse = await fetch("/api/workshop-registrations");
                if (registrationsResponse.ok) {
                    const registrationsData = await registrationsResponse.json();
                    setRegistrations(registrationsData);
                }
            } catch (err) {
                console.error("Error clearing notifications:", err);
                throw err;
            }
        },
        []
    );

    return {
        workshops,
        registrations,
        loading,
        error,
        createWorkshop,
        updateWorkshop,
        updateWorkshopStatus,
        registerForWorkshop,
        syncCalendar,
        getWorkshopById,
        getRegistrationsForWorkshop,
        getUserRegistration,
        clearNotifications,
    };
}
