import { app } from "./app.js";
import { env } from "./env.js";

app.listen(env.PORT, (error?: Error) => {
  if (error) {
    console.error(`Unable to start server: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Server listening on port ${env.PORT}`);
});
