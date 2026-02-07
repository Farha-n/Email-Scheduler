import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { authRouter } from "./routes/auth.js";
import { emailsRouter } from "./routes/emails.js";
export const createApp = () => {
    const app = express();
    app.use(cors({
        origin: env.FRONTEND_URL,
        credentials: true
    }));
    app.use(express.json({ limit: "2mb" }));
    app.use(session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax"
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            done(null, user ?? undefined);
        }
        catch (error) {
            done(error);
        }
    });
    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value ?? "";
            const name = profile.displayName || email;
            const avatar = profile.photos?.[0]?.value ?? null;
            const user = await prisma.user.upsert({
                where: { googleId },
                update: { name, email, avatar },
                create: { googleId, name, email, avatar }
            });
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
    app.use("/api/auth", authRouter);
    app.use("/api/emails", emailsRouter);
    return app;
};
