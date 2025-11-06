"use client";

import {SessionProvider} from "next-auth/react";
import React from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";

export default function Providers({children}: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AppRouterCacheProvider>
                {children}
            </AppRouterCacheProvider>
        </SessionProvider>
    );
}