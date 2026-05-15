import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * /demo simply forwards into the app shell — the queryClient is already in
 * forced-demo mode, so every page renders the demo dataset.
 */
export default function DemoPage() {
  redirect("/app/snapshot");
}
