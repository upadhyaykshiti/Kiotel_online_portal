"use client";

import dynamic from "next/dynamic";

const UniverSheet = dynamic(() => import("./UniverSheet"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Loading spreadsheet…
    </div>
  ),
});

export default UniverSheet;