"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserNotification = {
  id: string;
  type: string;
  title: string | null;
  message: string;
  url: string | null;
  readAt: string | null;
  createdAt: string;
};

type WorkshopNotification = {
  id: string;
  message: string;
  type: string;
  createdAt: string;
};

type WorkshopRegistration = {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  registeredAt: string;
  notifications: WorkshopNotification[];
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [systemNotifications, setSystemNotifications] = useState<UserNotification[]>([]);

  const [workshopLoading, setWorkshopLoading] = useState(false);
  const [workshopError, setWorkshopError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>([]);

  const unreadSystemCount = useMemo(
    () => systemNotifications.filter((n) => !n.readAt).length,
    [systemNotifications]
  );

  const unreadWorkshopCount = useMemo(() => {
    let count = 0;
    registrations.forEach((r) => (count += r.notifications.length));
    return count;
  }, [registrations]);

  const loadSystem = async () => {
    try {
      setSystemLoading(true);
      setSystemError(null);
      const res = await fetch("/api/user-notifications?limit=100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Greška pri učitavanju inboxa");
      setSystemNotifications(data);
    } catch (e) {
      setSystemError(e instanceof Error ? e.message : "Greška");
      setSystemNotifications([]);
    } finally {
      setSystemLoading(false);
    }
  };

  const loadWorkshops = async () => {
    try {
      setWorkshopLoading(true);
      setWorkshopError(null);
      const res = await fetch("/api/workshop-registrations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Greška pri učitavanju radionica");
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (e) {
      setWorkshopError(e instanceof Error ? e.message : "Greška");
      setRegistrations([]);
    } finally {
      setWorkshopLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void loadSystem();
      void loadWorkshops();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session?.user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Prijavite se kako biste vidjeli inbox obavijesti.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push("/LoginPage")}>
            Prijava
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2 }}>
        <Typography variant="h4">Inbox</Typography>
        <Button
          variant="outlined"
          onClick={() => {
            void loadSystem();
            void loadWorkshops();
          }}
        >
          Osvježi
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Sustav (${unreadSystemCount})`} />
        <Tab label={`Radionice (${unreadWorkshopCount})`} />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">Sustavne obavijesti</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={async () => {
                  await fetch("/api/user-notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markAllRead: true }),
                  });
                  void loadSystem();
                }}
              >
                Označi sve pročitano
              </Button>
              <Button
                size="small"
                color="error"
                onClick={async () => {
                  await fetch("/api/user-notifications?all=true", { method: "DELETE" });
                  void loadSystem();
                }}
              >
                Obriši sve
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {systemLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : systemError ? (
            <Alert severity="error">{systemError}</Alert>
          ) : systemNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema obavijesti.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {systemNotifications.map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: n.readAt ? "transparent" : "rgba(25, 118, 210, 0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                          {n.title || "Obavijest"}
                        </Typography>
                        <Chip size="small" label={n.type} variant="outlined" />
                        {!n.readAt && <Chip size="small" color="primary" label="Novo" />}
                      </Stack>
                      <Typography variant="body2">{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(n.createdAt).toLocaleString("hr-HR")}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {n.url && (
                        <Button size="small" variant="outlined" onClick={() => router.push(n.url!)}>
                          Otvori
                        </Button>
                      )}
                      {!n.readAt && (
                        <Button
                          size="small"
                          onClick={async () => {
                            await fetch("/api/user-notifications", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: n.id }),
                            });
                            void loadSystem();
                          }}
                        >
                          Pročitano
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={async () => {
                          await fetch(`/api/user-notifications?id=${encodeURIComponent(n.id)}`, { method: "DELETE" });
                          void loadSystem();
                        }}
                      >
                        Obriši
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">Radionice</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          {workshopLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : workshopError ? (
            <Alert severity="error">{workshopError}</Alert>
          ) : registrations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema registracija ni notifikacija.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {registrations.map((r) => (
                <Box key={r.id} sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Registracija: {new Date(r.registeredAt).toLocaleString("hr-HR")}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={async () => {
                        await fetch(`/api/workshop-notifications/${r.id}`, { method: "DELETE" });
                        void loadWorkshops();
                      }}
                    >
                      Očisti
                    </Button>
                  </Box>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {r.notifications.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nema notifikacija.
                      </Typography>
                    ) : (
                      r.notifications.map((n) => (
                        <Box key={n.id} sx={{ p: 1, borderRadius: 1, bgcolor: "rgba(0,0,0,0.03)" }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={n.type} variant="outlined" />
                            <Typography variant="body2">{n.message}</Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(n.createdAt).toLocaleString("hr-HR")}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}

