import { Suspense } from "react";
import NewDocClient from "./NewDocClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Creating document...</div>}>
      <NewDocClient />
    </Suspense>
  );
}