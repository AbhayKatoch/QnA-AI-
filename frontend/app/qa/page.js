"use client";
import { Suspense } from "react";
import QAInterface from "./QAInterface";

export default function QAPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
      <QAInterface />
    </Suspense>
  );
}
