import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Adapter stores OAuth accounts and links them to users
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  
  session: {
    strategy: "jwt", // JWT is more compatible with mixed auth providers
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // For OAuth - always sync with database to ensure user exists
      if (account?.provider === "google") {
        // Check if user exists in database, create if not
        const dbUser = await prisma.user.upsert({
          where: { email: token.email as string },
          update: {
            name: token.name as string,
            image: token.picture as string,
          },
          create: {
            email: token.email as string,
            name: token.name as string,
            image: token.picture as string,
            role: "USER",
          },
        });
        
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      
      // Periodically sync user data from database
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true, name: true, image: true }
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      
      // Note: OAuth access tokens are stored in the database via PrismaAdapter
      // in the Account table, not in the JWT. This is more secure.
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string || "";
        session.user.image = token.picture as string || null;
      }
      return session;
    },
    
    async signIn({ account }) {
      // For credentials provider, just allow sign in
      if (account?.provider === "credentials") {
        return true;
      }
      
      // For OAuth providers (like Google), the adapter handles user creation
      if (account?.provider === "google") {
        return true;
      }
      
      return true;
    }
  },
  
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
    async signIn({ user, isNewUser }) {
      console.log("User signed in:", user.email, "New user:", isNewUser);
    }
  },
  
  debug: process.env.NODE_ENV === "development",
};
