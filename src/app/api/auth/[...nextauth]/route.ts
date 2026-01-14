import {handlers} from "@/app/auth";
import {NextRequest, NextResponse} from "next/server";

type AppRouterHandler = (req: NextRequest) => Promise<NextResponse>;

export const GET = handlers.GET as AppRouterHandler
export const POST = handlers.POST as AppRouterHandler