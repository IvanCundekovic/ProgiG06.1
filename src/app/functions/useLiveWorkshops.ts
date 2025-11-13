import {useCallback, useEffect, useMemo, useState} from "react";
import type {
    LiveWorkshop,
    WorkshopNotification,
    WorkshopRegistration,
    WorkshopRequirement
} from "@/app/types/quiz";

type LiveWorkshopsState = {
    workshops: LiveWorkshop[];
    registrations: WorkshopRegistration[];
};

const STORAGE_KEY = "liveWorkshopsState";

const emptyState: LiveWorkshopsState = {
    workshops: [],
    registrations: []
};

const generateId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(16).slice(2)}-${Date.now()}`;
};

const isBrowser = typeof window !== "undefined";

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

export function useLiveWorkshops(initialData?: LiveWorkshopsState) {
    const [state, setState] = useState<LiveWorkshopsState>(initialData ?? emptyState);

    useEffect(() => {
        if (!isBrowser || initialData) {
            return;
        }
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as LiveWorkshopsState;
                setState({
                    workshops: parsed.workshops ?? [],
                    registrations: parsed.registrations ?? []
                });
            } catch (error) {
                console.warn("Neuspjelo parsiranje liveWorkshopsState:", error);
            }
        }
    }, [initialData]);

    useEffect(() => {
        if (!isBrowser || initialData) {
            return;
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [initialData, state]);

    const workshops = useMemo(() => state.workshops, [state.workshops]);
    const registrations = useMemo(() => state.registrations, [state.registrations]);

    const createWorkshop = useCallback(
        ({
            title,
            description,
            scheduledAt,
            durationMinutes,
            capacity,
            meetingUrl,
            requirements,
            instructorId,
            instructorName
        }: CreateWorkshopInput) => {
            const now = new Date().toISOString();
            const newWorkshop: LiveWorkshop = {
                id: generateId(),
                title,
                description,
                scheduledAt,
                durationMinutes,
                capacity,
                meetingUrl,
                requirements,
                instructorId,
                instructorName,
                status: "upcoming",
                createdAt: now,
                updatedAt: now,
                lastConnectionStatus: "stable"
            };

            setState(prev => ({
                ...prev,
                workshops: [...prev.workshops, newWorkshop]
            }));

            return newWorkshop;
        },
        []
    );

    const updateWorkshop = useCallback(
        ({id, ...updates}: UpdateWorkshopInput) => {
            const now = new Date().toISOString();
            setState(prev => ({
                ...prev,
                workshops: prev.workshops.map(workshop =>
                    workshop.id === id
                        ? {
                              ...workshop,
                              ...updates,
                              updatedAt: now
                          }
                        : workshop
                ),
                registrations: prev.registrations.map(registration =>
                    registration.workshopId === id && updates.scheduledAt
                        ? {
                              ...registration,
                              notifications: [
                                  ...registration.notifications,
                                  {
                                      id: generateId(),
                                      type: "schedule_change",
                                      message: `Radionica "${updates.title ?? workshopTitle(prev.workshops, id)}" pomaknuta je na ${new Date(
                                          updates.scheduledAt
                                      ).toLocaleString("hr-HR")}.`,
                                      createdAt: now
                                  } satisfies WorkshopNotification
                              ]
                          }
                        : registration
                )
            }));
        },
        []
    );

    const updateWorkshopStatus = useCallback(({workshopId, status, connectionStatus}: UpdateStatusInput) => {
        const now = new Date().toISOString();
        setState(prev => ({
            ...prev,
            workshops: prev.workshops.map(workshop =>
                workshop.id === workshopId
                    ? {
                          ...workshop,
                          status,
                          lastConnectionStatus: connectionStatus ?? workshop.lastConnectionStatus,
                          updatedAt: now
                      }
                    : workshop
            ),
            registrations:
                status === "in_progress" || status === "completed" || connectionStatus === "reconnecting"
                    ? prev.registrations.map(registration =>
                          registration.workshopId === workshopId
                              ? {
                                    ...registration,
                                    notifications: [
                                        ...registration.notifications,
                                        {
                                            id: generateId(),
                                            type: connectionStatus === "reconnecting" ? "reconnection" : "general",
                                            message:
                                                connectionStatus === "reconnecting"
                                                    ? `Radionica "${workshopTitle(prev.workshops, workshopId)}" pokušava ponovno uspostaviti vezu.`
                                                    : status === "in_progress"
                                                    ? `Radionica "${workshopTitle(prev.workshops, workshopId)}" je započela.`
                                                    : `Radionica "${workshopTitle(prev.workshops, workshopId)}" je završila.`,
                                            createdAt: now
                                        } satisfies WorkshopNotification
                                    ]
                                }
                              : registration
                      )
                    : prev.registrations
        }));
    }, []);

    const registerForWorkshop = useCallback(
        ({workshopId, userId, userName}: RegisterForWorkshopInput) => {
            const workshop = state.workshops.find(item => item.id === workshopId);
            if (!workshop) {
                throw new Error("Radionica nije pronađena.");
            }

            const currentRegistrations = state.registrations.filter(reg => reg.workshopId === workshopId);

            if (currentRegistrations.some(reg => reg.userId === userId)) {
                throw new Error("Već ste prijavljeni na ovu radionicu.");
            }

            if (currentRegistrations.length >= workshop.capacity) {
                throw new Error("Radionica je dostigla maksimalan broj polaznika.");
            }

            const now = new Date().toISOString();
            const newRegistration: WorkshopRegistration = {
                id: generateId(),
                workshopId,
                userId,
                userName,
                registeredAt: now,
                notifications: [
                    {
                        id: generateId(),
                        type: "general",
                        message: `Uspješno ste prijavljeni na radionicu "${workshop.title}".`,
                        createdAt: now
                    }
                ]
            };

            setState(prev => ({
                ...prev,
                registrations: [...prev.registrations, newRegistration]
            }));

            return newRegistration;
        },
        [state.registrations, state.workshops]
    );

    const syncCalendar = useCallback(({workshopId}: SyncCalendarInput) => {
        const now = new Date().toISOString();
        setState(prev => ({
            ...prev,
            workshops: prev.workshops.map(workshop =>
                workshop.id === workshopId
                    ? {
                          ...workshop,
                          calendarSyncedAt: now,
                          updatedAt: now
                      }
                    : workshop
            )
        }));
    }, []);

    const getWorkshopById = useCallback(
        (id: string) => state.workshops.find(workshop => workshop.id === id),
        [state.workshops]
    );

    const getRegistrationsForWorkshop = useCallback(
        (workshopId: string) => state.registrations.filter(reg => reg.workshopId === workshopId),
        [state.registrations]
    );

    const getUserRegistration = useCallback(
        (workshopId: string, userId: string) =>
            state.registrations.find(registration => registration.workshopId === workshopId && registration.userId === userId),
        [state.registrations]
    );

    const clearNotifications = useCallback((registrationId: string) => {
        setState(prev => ({
            ...prev,
            registrations: prev.registrations.map(registration =>
                registration.id === registrationId
                    ? {
                          ...registration,
                          notifications: []
                      }
                    : registration
            )
        }));
    }, []);

    return {
        workshops,
        registrations,
        createWorkshop,
        updateWorkshop,
        updateWorkshopStatus,
        registerForWorkshop,
        syncCalendar,
        getWorkshopById,
        getRegistrationsForWorkshop,
        getUserRegistration,
        clearNotifications
    };
}

const workshopTitle = (workshops: LiveWorkshop[], id: string) => {
    const found = workshops.find(workshop => workshop.id === id);
    return found ? found.title : "Radionica";
};

