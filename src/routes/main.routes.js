import authRoutes from "./auth.routes.js";
import leadRoutes from "./lead.routes.js";

const mainRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
};

export default mainRoutes;

//shivam
