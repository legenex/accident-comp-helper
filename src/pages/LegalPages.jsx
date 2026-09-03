import React from "react";
import { PageHero, Section } from "@/components/site/ui";

function LegalLayout({ title, updated, children }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={updated ? `Last updated: ${updated}` : "This page describes how we handle your information."} />
      <Section className="bg-white">
        <article className="prose-legal mx-auto max-w-3xl text-navy">{children}</article>
      </Section>
    </>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="September 2026">
      <p>Your privacy matters to us. This Privacy Policy explains how Accident Compensation Helper ("we", "us") collects, uses, and protects your information when you use our website and claim check.</p>
      <h2>Information We Collect</h2>
      <p>We collect the details you provide during the claim check, such as the type of accident, when and where it happened, and whether you were injured. We may also collect contact information if you choose to request a connection with a participating attorney.</p>
      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and improve the claim check.</li>
        <li>To determine whether your situation may qualify.</li>
        <li>To connect you with a participating attorney if you request it.</li>
        <li>To communicate with you about your inquiry.</li>
      </ul>
      <h2>Sharing Your Information</h2>
      <p>We only share your details with a participating attorney if you choose to request contact. We do not sell your personal information. We may share information when required by law or to protect our rights.</p>
      <h2>Data Security</h2>
      <p>We use reasonable safeguards to protect your information. No method of transmission over the internet is completely secure, but we work to protect your data.</p>
      <h2>Your Choices</h2>
      <p>You are not required to complete the claim check. You may request access to or deletion of your information by contacting us at support@accidentcompensationhelper.com.</p>
      <h2>Contact</h2>
      <p>Questions about this policy? Email support@accidentcompensationhelper.com.</p>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="September 2026">
      <p>These Terms govern your use of Accident Compensation Helper. By using this site, you agree to these Terms.</p>
      <h2>Our Service</h2>
      <p>We provide a free, confidential claim check and, if you choose, a connection to a participating attorney. We are not a law firm and do not provide legal advice.</p>
      <h2>No Attorney-Client Relationship</h2>
      <p>Using this site does not create an attorney-client relationship. Any relationship with an attorney is formed separately and only with that attorney.</p>
      <h2>Use of the Site</h2>
      <p>You agree to use the site lawfully and not to misuse or disrupt it. You agree to provide accurate information.</p>
      <h2>Disclaimer</h2>
      <p>The site is provided "as is" without warranties. We do not guarantee any particular outcome from the claim check.</p>
      <h2>Changes</h2>
      <p>We may update these Terms from time to time. Continued use of the site means you accept the updated Terms.</p>
    </LegalLayout>
  );
}

export function PrivacyChoices() {
  return (
    <LegalLayout title="Your Privacy Choices" updated="September 2026">
      <p>You have choices about how your information is used. This page explains the options available to you.</p>
      <h2>Opt Out of Sharing</h2>
      <p>You may choose not to complete the claim check, or not to request a connection with a participating attorney. We will not share your details with an attorney unless you choose to do so.</p>
      <h2>Access and Deletion</h2>
      <p>You may request access to or deletion of the information you provided by contacting support@accidentcompensationhelper.com.</p>
      <h2>Marketing Communications</h2>
      <p>You can opt out of marketing communications at any time by following the unsubscribe link in any email or by contacting us.</p>
    </LegalLayout>
  );
}