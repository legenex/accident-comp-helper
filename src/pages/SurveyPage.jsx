import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ShieldCheck, Lock, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { QUIZ_URL } from "@/lib/siteContent";

// Public survey renderer. Renders a Survey built in the admin Survey Builder:
// its questions, conditional visibility, contact capture and consent, then
// resolves qualification ONCE at the end and routes per completion_routing.
//
// If no matching published survey exists, this falls back to the hosted quiz
// so an existing /s/<slug> link never dead-ends.

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function matchesCondition(answers, showIf) {
  if (!showIf?.field) return true;
  const actual = answers[showIf.field];
  const target = showIf.value;
  switch (showIf.operator) {
    case "not_equals": return String(actual ?? "") !== String(target ?? "");
    case "contains": return String(actual ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case "is_in": return String(target ?? "").split(",").map((s) => s.trim()).includes(String(actual ?? ""));
    default: return String(actual ?? "") === String(target ?? "");
  }
}

function Progress({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mx-auto mb-8 max-w-xl">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/50">
        <span>Question {Math.min(current + 1, total)} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SurveyPage() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ first_name: "", last_name: "", email: "", mobile: "" });
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    base44.entities.Survey.filter({ slug, status: "published" }, "-created_date", 1)
      .then((r) => {
        const found = (r ?? [])[0] ?? null;
        setSurvey(found);
        // No published survey for this slug — send them to the hosted quiz
        // rather than showing a broken page.
        if (!found) window.location.href = QUIZ_URL;
      })
      .catch(() => { window.location.href = QUIZ_URL; })
      .finally(() => setLoading(false));
  }, [slug]);

  // Count a response once the visitor starts.
  useEffect(() => {
    if (survey?.id) {
      base44.entities.Survey.update(survey.id, { responses: (survey.responses || 0) + 1 }).catch(() => {});
    }
     
  }, [survey?.id]);

  const visible = useMemo(
    () => (survey?.questions || []).filter((q) => matchesCondition(answers, q.show_if)),
    [survey, answers]
  );

  const atContactStep = survey && step >= visible.length;
  const current = visible[step];

  useEffect(() => { setTextValue(current?.field_name ? (answers[current.field_name] || "") : ""); }, [step, current, answers]);

  const answer = (fieldName, value) => {
    const next = { ...answers, [fieldName]: value };
    setAnswers(next);
    setStep(step + 1);
  };

  // Qualification is resolved HERE, at the end, never mid-flow. Every
  // respondent answers every applicable question first.
  const resolveOutcome = (finalAnswers) => {
    const hits = [];
    for (const q of (survey.questions || [])) {
      if (!matchesCondition(finalAnswers, q.show_if)) continue;
      for (const o of (q.options || [])) {
        if (o.dq && String(finalAnswers[q.field_name] ?? "") === String(o.value)) {
          hits.push(o.dq_reason || `${q.prompt}: ${o.label}`);
        }
      }
    }
    return { disqualified: hits.length > 0, reasons: hits };
  };

  const submit = async () => {
    if (!consented || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const { disqualified, reasons } = resolveOutcome(answers);
    const routing = survey.completion_routing || {};
    const destination =
      (disqualified ? routing.disqualified_url : routing.qualified_url) || routing.fallback_url || "/thanks";

    const params = new URLSearchParams(window.location.search);
    try {
      const res = await base44.functions.invoke("ingestLead", {
        ...answers,
        ...contact,
        qualification_status: disqualified ? "hard_dq" : "qualified",
        disqualify_reason: reasons.join("; ") || undefined,
        source: "quiz",
        source_ref: survey.slug,
        consent_text: survey.consent_text || undefined,
        consent_version: survey.consent_version || undefined,
        consent_timestamp: new Date().toISOString(),
        landing_url: window.location.href,
        referrer_url: document.referrer || undefined,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
        ad_label: params.get("ad_label") || undefined,
        gclid: params.get("gclid") || undefined,
        fbclid: params.get("fbclid") || undefined,
      });
      const payload = res?.data || res;
      if (payload?.ok === false) {
        setSubmitError(payload.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      base44.entities.Survey.update(survey.id, { completions: (survey.completions || 0) + 1 }).catch(() => {});
      window.location.href = destination;
    } catch (e) {
      setSubmitError(e?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
          <p className="mt-6 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{survey.title}</h1>
          {survey.description && step === 0 && <p className="mt-3 text-white/60">{survey.description}</p>}
        </div>

        <div className="mt-10">
          <Progress current={atContactStep ? visible.length : step} total={visible.length + 1} />

          {!atContactStep && current && (
            <div className="mx-auto max-w-xl">
              <h2 className="text-center font-heading text-xl font-bold sm:text-2xl">{current.prompt}</h2>
              {current.help_text && <p className="mt-2 text-center text-sm text-white/55">{current.help_text}</p>}

              <div className="mt-8 space-y-3">
                {(current.type === "single" || current.type === "multi") && (current.options || []).map((o, i) => (
                  <button
                    key={i}
                    onClick={() => answer(current.field_name, o.value)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 text-left text-base font-medium transition-all hover:border-brand hover:bg-brand/10"
                  >
                    {o.label || o.value}
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </button>
                ))}

                {current.type === "state" && (
                  <select
                    value={answers[current.field_name] || ""}
                    onChange={(e) => answer(current.field_name, e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-navy px-5 py-4 text-base outline-none focus:border-brand"
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}

                {["text", "number", "date", "email", "phone"].includes(current.type) && (
                  <div className="space-y-3">
                    <input
                      type={current.type === "number" ? "number" : current.type === "date" ? "date" : current.type === "email" ? "email" : current.type === "phone" ? "tel" : "text"}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (textValue || !current.required)) answer(current.field_name, textValue); }}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 text-base outline-none focus:border-brand"
                      placeholder="Type your answer"
                    />
                    <button
                      onClick={() => answer(current.field_name, textValue)}
                      disabled={current.required && !textValue}
                      className="w-full rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>

              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="mx-auto mt-6 block text-sm text-white/40 hover:text-white/70">
                  Go back
                </button>
              )}
            </div>
          )}

          {atContactStep && (
            <div className="mx-auto max-w-xl">
              <h2 className="text-center font-heading text-xl font-bold sm:text-2xl">Where should we send your result?</h2>
              <div className="mt-8 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={contact.first_name} onChange={(e) => setContact({ ...contact, first_name: e.target.value })} placeholder="First name" className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base outline-none focus:border-brand" />
                  <input value={contact.last_name} onChange={(e) => setContact({ ...contact, last_name: e.target.value })} placeholder="Last name" className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base outline-none focus:border-brand" />
                </div>
                <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email address" className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base outline-none focus:border-brand" />
                <input type="tel" value={contact.mobile} onChange={(e) => setContact({ ...contact, mobile: e.target.value })} placeholder="Phone number" className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base outline-none focus:border-brand" />

                {survey.consent_text && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1" />
                    <span className="text-xs leading-relaxed text-white/55">{survey.consent_text}</span>
                  </label>
                )}
                {!survey.consent_text && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1" />
                    <span className="text-xs leading-relaxed text-white/55">
                      I agree to be contacted about my potential claim by a participating attorney or their representative,
                      including by phone, text and email. Consent is not a condition of any service.
                    </span>
                  </label>
                )}

                {submitError && <p className="text-sm text-red-400">{submitError}</p>}

                <button
                  onClick={submit}
                  disabled={!consented || (!contact.email && !contact.mobile) || submitting}
                  title={!consented ? "Please agree to be contacted first" : (!contact.email && !contact.mobile) ? "Enter an email address or phone number" : undefined}
                  className="w-full rounded-full bg-brand px-6 py-4 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : (survey.submit_button_text || "See my result")}
                </button>
              </div>

              <button onClick={() => setStep(step - 1)} className="mx-auto mt-6 block text-sm text-white/40 hover:text-white/70">Go back</button>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Takes about 2 minutes</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Free to use</span>
          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Handled securely</span>
        </div>
      </div>
    </div>
  );
}
