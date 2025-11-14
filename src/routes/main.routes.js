import authRoutes from "./auth.routes.js";
import leadRoutes from "./lead.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";

const mainRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
};

export default mainRoutes;

//shivam
