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

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    const result = await WebsiteProfiler.deleteProfile(url, session.user.id)
    
    return NextResponse.json({
      message: "Website profile deleted successfully",
      ...result
    })
  } catch (error) {
    console.error("Error deleting profile:", error)
    
    if (error instanceof Error && error.message === 'Website profile not found') {
      return NextResponse.json(
        { error: "Website profile not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete website profile" },
      { status: 500 }
    )
  }
}
