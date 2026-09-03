import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { QUIZ_URL } from "@/lib/siteContent";

// Public survey route: every survey routes the visitor to the quiz destination.
export default function SurveyPage() {
  const { slug } = useParams();
  useEffect(() => { window.location.href = QUIZ_URL; }, [slug]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
        <p className="mt-6 text-lg font-semibold">Starting your survey...</p>
      </div>
    </div>
  );
}