import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { WebsiteProfiler } from "@/lib/website-profiler"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const profiles = await WebsiteProfiler.getUserProfiles(session.user.id, limit, offset)
    
    return NextResponse.json({
      profiles,
      total: profiles.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json(
      { error: "Failed to fetch website profiles" },
      { status: 500 }
    )
  }
}
