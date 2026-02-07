import { createApp } from "./app";
import { env } from "./config/env";
import "./queue/queue";
import "./workers/emailWorker";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
