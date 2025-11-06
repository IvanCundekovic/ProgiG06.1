import {authOptions} from "@/app/auth"
import NextAuth from "next-auth"
import {NextRequest, NextResponse} from "next/server";

type AppRouterHandler = (req: NextRequest) => Promise<NextResponse>;

const {handlers} = NextAuth(authOptions)

export const GET = handlers.GET as AppRouterHandler
export const POST = handlers.POST as AppRouterHandler