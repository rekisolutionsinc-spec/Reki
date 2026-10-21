import { NextResponse } from "next/server";

export const runtime = "nodejs";

const frequencies = ["one-time", "monthly", "quarterly", "annually"] as const;
type Frequency = (typeof frequencies)[number];

type PaystackResponse<T> = {
  status: boolean;
  message?: string;
  data?: T;
};

type PlanData = { plan_code?: string };
type TransactionData = { authorization_url?: string };

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Online donations are being configured. Please contact info@spursbasefoundation.org." },
      { status: 503 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid donation details." }, { status: 400 });
  }

  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Invalid donation details." }, { status: 400 });
  }

  const { fullName, email, amount, frequency } = input as Record<string, unknown>;
  const donorName = typeof fullName === "string" ? fullName.trim() : "";
  const donorEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const donationAmount = typeof amount === "string" || typeof amount === "number" ? Number(amount) : NaN;

  if (
    donorName.length < 2 || donorName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail) || donorEmail.length > 254 ||
    !Number.isSafeInteger(donationAmount) || donationAmount < 1 || donationAmount > 1_000_000 ||
    typeof frequency !== "string" || !frequencies.includes(frequency as Frequency)
  ) {
    return NextResponse.json({ error: "Check your name, email, amount, and donation frequency." }, { status: 400 });
  }

  const amountInPesewas = donationAmount * 100;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.spursbasefoundation.org";

  try {
    let planCode: string | undefined;
    if (frequency !== "one-time") {
      const planResponse = await fetch("https://api.paystack.co/plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Spursbase Foundation ${frequency} donation GHS ${donationAmount}`,
          interval: frequency,
          amount: amountInPesewas,
          currency: "GHS",
        }),
        cache: "no-store",
      });
      const planResult = await planResponse.json() as PaystackResponse<PlanData>;
      if (!planResponse.ok || !planResult.status || !planResult.data?.plan_code) {
        return NextResponse.json({ error: "We could not prepare recurring payments. Please try again later." }, { status: 502 });
      }
      planCode = planResult.data.plan_code;
    }

    const transactionResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: donorEmail,
        amount: amountInPesewas,
        currency: "GHS",
        callback_url: new URL("/donation/verify", baseUrl).toString(),
        ...(planCode ? { plan: planCode } : {}),
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: donorName },
            { display_name: "Frequency", variable_name: "frequency", value: frequency },
          ],
        },
      }),
      cache: "no-store",
    });
    const transactionResult = await transactionResponse.json() as PaystackResponse<TransactionData>;
    if (!transactionResponse.ok || !transactionResult.status || !transactionResult.data?.authorization_url) {
      return NextResponse.json({ error: "We could not start your donation. Please try again later." }, { status: 502 });
    }

    return NextResponse.json({ authorizationUrl: transactionResult.data.authorization_url });
  } catch {
    return NextResponse.json({ error: "The payment service is temporarily unavailable. Please try again." }, { status: 502 });
  }
}