import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "itadaki-health",
  name: "Itadaki Health",
  isDev: process.env.INNGEST_DEV === "1" || !process.env.INNGEST_SIGNING_KEY,
});
