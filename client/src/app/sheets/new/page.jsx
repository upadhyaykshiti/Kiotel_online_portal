import { Suspense } from "react";
import NewSheetClient from "./NewSheetClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Creating sheet...</div>}>
      <NewSheetClient />
    </Suspense>
  );
}