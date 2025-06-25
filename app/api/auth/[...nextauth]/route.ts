import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/mongodb"
import { User } from "@/lib/auth-models"

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }, // register or login
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        await connectToDatabase()

        try {
          if (credentials.action === "register") {
            // Registration
            if (!credentials.name) {
              throw new Error("Name is required for registration")
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: credentials.email })
            if (existingUser) {
              throw new Error("User already exists with this email")
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(credentials.password, 12)

            // Create user
            const newUser = new User({
              name: credentials.name,
              email: credentials.email,
              password: hashedPassword,
            })

            await newUser.save()

            return {
              id: newUser._id.toString(),
              name: newUser.name,
              email: newUser.email,
            }
          } else {
            // Login
            const user = await User.findOne({ email: credentials.email })
            if (!user) {
              throw new Error("No user found with this email")
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) {
              throw new Error("Invalid password")
            }

            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
            }
          }
        } catch (error: any) {
          console.error("Auth error:", error)
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
