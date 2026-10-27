import { Suspense } from "react";
import NewWorkClient from "./NewWorkClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Creating work...</div>}>
      <NewWorkClient />
    </Suspense>
  );
}