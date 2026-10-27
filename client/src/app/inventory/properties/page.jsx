"use client";
// Properties and Cabins were merged into one page. This route is kept so old
// links and bookmarks still work — it forwards to the combined view with the
// Properties list already showing.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "../inventory.css";

export default function PropertiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inventory/locations?view=properties");
  }, [router]);

  return (
    <div className="list-empty">
      <div className="inv-spinner" />
      <div className="list-empty-sub" style={{ marginTop: 12 }}>
        Taking you to Properties &amp; Cabins…
      </div>
    </div>
  );
}
