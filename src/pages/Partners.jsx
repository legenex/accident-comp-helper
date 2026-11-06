import React, { useEffect } from "react";
import { PageHero, Section } from "@/components/site/ui";
import AttorneyDirectory from "@/components/site/AttorneyDirectory";
import { MARKETING_PARTNERS } from "@/lib/partnersData";

export default function Partners() {
  useEffect(() => {
    document.title = "Partners | Accident Compensation Helper";
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Partners"
        subtitle="Marketing partners and participating attorneys in the Accident Compensation Helper network."
      />

      <Section className="bg-slate-50">
        <div className="mx-auto max-w-6xl text-navy">
          <p className="max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Accident Compensation Helper is a free matching service operated by Next Consulting LLC. We
            are not a law firm and we do not provide legal advice. When you submit your information
            through this Site, you may be contacted by the marketing partners listed below and may be
            connected with one of the participating attorneys listed below, who are independently
            licensed in their state. The following lists the marketing partners and participating
            attorneys that may contact you or receive your information.
          </p>

          <section className="mt-12">
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
              Marketing Partners
            </h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MARKETING_PARTNERS.map((name) => (
                <li
                  key={name}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm"
                >
                  {name}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 border-t border-slate-200 pt-12">
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
              Participating Attorneys
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
              The attorneys and firms below participate in the Accident Compensation Helper matching
              network. They are independently licensed in their respective states and make their own
              decisions about which cases to accept.
            </p>
            <div className="mt-6">
              <AttorneyDirectory />
            </div>
          </section>
        </div>
      </Section>
    </>
  );
}