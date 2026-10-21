import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Donation status",
  robots: { index: false, follow: false },
};

type VerifyResponse = {
  status: boolean;
  data?: { status?: string; reference?: string };
};

type PageProps = { searchParams: Promise<{ reference?: string }> };

export default async function DonationVerifyPage({ searchParams }: PageProps) {
  const { reference } = await searchParams;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  let isSuccessful = false;
  let couldVerify = false;

  if (secretKey && reference && /^[\w-]{6,100}$/.test(reference)) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      });
      const result = await response.json() as VerifyResponse;
      couldVerify = response.ok && result.status;
      isSuccessful = couldVerify && result.data?.status === "success";
    } catch {
      couldVerify = false;
    }
  }

  return (
    <main id="main-content" className="article-shell donation-result">
      <p className="eyebrow">Spursbase Foundation</p>
      <h1>{isSuccessful ? "Thank you for your support." : "We couldn’t confirm your donation yet."}</h1>
      <p>
        {isSuccessful
          ? "Your payment was successful. Your support can help transform lives and build stronger communities."
          : couldVerify
            ? "The payment was not completed. You can return to the donation form to try again."
            : "If your payment was completed, contact info@spursbasefoundation.org and include your Paystack reference."}
      </p>
      {reference && <p>Reference: <code>{reference}</code></p>}
      <Link className="button button--dark" href="/#give">Return to Spursbase Foundation</Link>
    </main>
  );
}