import express from "express";
import { PORT } from "./config/constants";
import emailRouter from "./routes/emailRouter";

//routers
// import testRouter from "./routes/testRouter";
import mailSyncRouter from "./routes/mailSyncRouter";
import idleRouter from "./routes/idleRouter";

const app = express();

app.use(express.json());
app.use("/emails", emailRouter);
// app.use("/test", testRouter);
app.use("/sync", mailSyncRouter);
app.use("/idle", idleRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("CleverInbox API is running 🚀");
});
