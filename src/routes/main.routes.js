import authRoutes from "./auth.routes.js";
import leadRoutes from "./lead.routes.js";
import userRoutes from "./user.routes.js";

const mainRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/users", userRoutes);
};

export default mainRoutes;

//shivam
