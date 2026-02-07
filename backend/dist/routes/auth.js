import { Router } from "express";
import passport from "passport";
import { env } from "../config/env.js";
export const authRouter = Router();
authRouter.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: `${env.FRONTEND_URL}/login` }), (req, res) => {
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
});
authRouter.get("/me", (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ user: null });
    }
    const user = req.user;
    return res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar ?? null
        }
    });
});
authRouter.post("/logout", (req, res) => {
    req.logout(() => {
        res.json({ success: true });
    });
});
