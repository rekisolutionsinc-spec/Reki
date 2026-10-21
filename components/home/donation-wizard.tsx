"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const frequencies = [
  { value: "one-time", label: "One-Time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
] as const;

type Frequency = (typeof frequencies)[number]["value"];
type Step = 1 | 2;

export function DonationWizard() {
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [amount, setAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function continueToDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Number(amount) < 1 || !Number.isFinite(Number(amount))) {
      setStatus("Enter a donation amount of at least GHS 1.");
      return;
    }
    setStatus("");
    setStep(2);
  }

  async function submitDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptTerms) {
      setStatus("Please accept the terms to continue.");
      return;
    }

    setStatus("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donations/initialize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, email, amount, frequency }),
      });
      const result: { authorizationUrl?: string; error?: string } = await response.json();
      if (!response.ok || !result.authorizationUrl) {
        setStatus(result.error ?? "We could not start your donation. Please try again.");
        return;
      }
      window.location.assign(result.authorizationUrl);
    } catch {
      setStatus("We could not connect to the payment service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="donation-card">
      <div className="donation-card__step" aria-live="polite">
        <span>{step}</span> Step {step} of 2
      </div>
      {step === 1 ? (
        <form onSubmit={continueToDetails} aria-labelledby="donation-step-one-title">
          <h3 id="donation-step-one-title">Choose your gift</h3>
          <div className="frequency-options" role="group" aria-label="Donation frequency">
            {frequencies.map((item) => (
              <button
                className="frequency-option"
                key={item.value}
                type="button"
                aria-pressed={frequency === item.value}
                onClick={() => setFrequency(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="donation-field" htmlFor="donation-amount">
            Amount (GHS)
            <input
              id="donation-amount"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              aria-describedby="donation-frequency-note"
            />
          </label>
          <p className="donation-note" id="donation-frequency-note">Your gift frequency is {frequencies.find((item) => item.value === frequency)?.label.toLowerCase()}.</p>
          <div className="donation-actions">
            <button className="button button--dark" type="submit">Continue <span aria-hidden="true">→</span></button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitDonation} aria-labelledby="donation-step-two-title">
          <h3 id="donation-step-two-title">Your details</h3>
          <label className="donation-field" htmlFor="donor-name">
            Full Name
            <input id="donor-name" type="text" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="donation-field" htmlFor="donor-email">
            Email
            <input id="donor-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <p className="donation-summary">{frequencies.find((item) => item.value === frequency)?.label} gift · GHS {Number(amount || 0).toLocaleString("en")}</p>
          <label className="terms-field" htmlFor="donation-terms">
            <input id="donation-terms" type="checkbox" required checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
            <span>I accept the <a href="https://www.spursbasefoundation.org/terms.html" target="_blank" rel="noreferrer">terms and conditions</a>.</span>
          </label>
          <div className="donation-actions">
            <button className="button button--back" type="button" onClick={() => { setStep(1); setStatus(""); }}>Back</button>
            <button className="button button--dark" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connecting…" : "Continue to payment"}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
          </div>
        </form>
      )}
      {status && <p className="donation-message" role="alert">{status}</p>}
      <p className="donation-note">Secure payment by Paystack. See our <Link href="/privacy">privacy policy</Link>.</p>
    </div>
  );
}