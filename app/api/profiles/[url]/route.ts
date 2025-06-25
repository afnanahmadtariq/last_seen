import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { WebsiteProfiler } from "@/lib/website-profiler"

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  try {
    const decodedUrl = decodeURIComponent(params.url)
    
    const profileData = await WebsiteProfiler.getWebsiteProfile(decodedUrl, session.user.id)
    
    if (!profileData) {
      return NextResponse.json(
        { error: "Website profile not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profileData)
  } catch (error) {
    console.error("Error fetching website profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch website profile" },
      { status: 500 }
    )
  }
}
