import { createApp } from "./app.js";
import { env } from "./config/env.js";
import "./queue/queue.js";
import "./workers/emailWorker.js";
const app = createApp();
app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
});
