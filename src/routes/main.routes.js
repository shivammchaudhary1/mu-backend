import authRoutes from "./auth.routes.js";

const mainRoutes = (app) => {
  app.use("/api/auth", authRoutes);
};

export default mainRoutes;
