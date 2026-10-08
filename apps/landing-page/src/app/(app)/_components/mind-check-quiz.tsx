"use client";

import { useMemo, useState } from "react";
import { PACKAGES, formatINR, recommendedPackageId, type CatalogPackage } from "@/lib/mind-check/catalog";
import { QUESTIONS, computeOverallPercent, getBand, scoreAnswers, levelLabels } from "@/lib/mind-check/assessment";
import { GENDER_OPTIONS } from "@/lib/mind-check/customer";
import { site, whatsappLink } from "@/lib/mind-check/site";
import Link from "next/link";
import "./mind-check.css";

type ScreenId = "intro" | "quiz" | "loading" | "paywall" | "checkout" | "result";

interface CheckoutFields {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  city: string;
  consent: boolean;
}

const EMPTY_CHECKOUT: CheckoutFields = { name: "", phone: "", email: "", age: "", gender: "", city: "", consent: false };

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type MindCheckQuizProps = {
  // intro: the homepage card that links to the dedicated page. quiz: the questions, used on /mind-check.
  mode?: "intro" | "quiz";
};

export function MindCheckQuiz({ mode = "intro" }: MindCheckQuizProps) {
  const [screen, setScreen] = useState<ScreenId>(mode === "quiz" ? "quiz" : "intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(QUESTIONS.length).fill(0));
  const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | null>(null);
  const [checkout, setCheckout] = useState<CheckoutFields>(EMPTY_CHECKOUT);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [ctaLabel, setCtaLabel] = useState<{ title: string; sub: string; button: string } | null>(null);

  const overallPercent = useMemo(() => computeOverallPercent(answers), [answers]);
  const band = useMemo(() => getBand(overallPercent), [overallPercent]);
  const dimensions = useMemo(() => scoreAnswers(answers).dimensions, [answers]);
  const recommendedId = useMemo(() => recommendedPackageId(overallPercent), [overallPercent]);

  const RING_RADIUS = 52;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  function startQuiz() {
    setScreen("quiz");
  }

  function selectAnswer(points: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = points;
      return next;
    });
    if (current + 1 < QUESTIONS.length) {
      setCurrent((value) => value + 1);
    } else {
      setScreen("loading");
      setTimeout(() => setScreen("paywall"), 1400);
    }
  }

  function goBack() {
    if (current > 0) setCurrent((value) => value - 1);
  }

  function skipToResult() {
    setUnlocked(false);
    setSelectedPackage(null);
    setCtaLabel({
      title: "Want a clear plan to improve this?",
      sub: "Most people at your score start with the Essential or Growth package.",
      button: "See Recommended Package",
    });
    setScreen("result");
  }

  function pickPackage(pkg: CatalogPackage) {
    setSelectedPackage(pkg);
    setCheckoutError(null);
    setScreen("checkout");
  }

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) return;
    if (!checkout.name || !checkout.phone || !checkout.email || !checkout.city || !checkout.consent) {
      setCheckoutError("Please fill in all required fields and accept consent.");
      return;
    }

    setSubmitting(true);
    setCheckoutError(null);

    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          customer: {
            name: checkout.name,
            phone: checkout.phone,
            email: checkout.email,
            age: Number(checkout.age) || 0,
            gender: checkout.gender,
            city: checkout.city,
          },
          answers,
        }),
      });

      if (!createRes.ok) throw new Error("Could not start checkout");
      const order = await createRes.json();

      if (order.simulated) {
        await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localOrderId: order.localOrderId, simulated: true }),
        });
        finishPayment(selectedPackage);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setCheckoutError("Could not load Razorpay checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Positive Mind Care",
        description: `${selectedPackage.name} package`,
        order_id: order.orderId,
        prefill: { name: checkout.name, email: checkout.email, contact: checkout.phone },
        theme: { color: "#3E4F3A" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ localOrderId: order.localOrderId, simulated: false, ...response }),
          });
          finishPayment(selectedPackage);
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function finishPayment(pkg: CatalogPackage) {
    setUnlocked(true);
    setSubmitting(false);
    setCtaLabel({
      title: `Confirm your ${pkg.name} Package`,
      sub: "Your first session can be booked in under a minute.",
      button: `Confirm & Book — ${pkg.name}`,
    });
    setScreen("result");
  }

  function handleConfirmBook() {
    if (!selectedPackage) return;
    const firstName = checkout.name.split(" ")[0] || "there";
    const message = `Namaste, I'm ${firstName}. I just completed my Mind Check (score ${overallPercent}/100) and paid for the ${selectedPackage.name} package. I'd like to book my first session.`;
    window.open(whatsappLink(message, `91${site.phoneDigits}`), "_blank", "noopener,noreferrer");
  }

  const question = QUESTIONS[current];
  const progressPercent = Math.round((current / QUESTIONS.length) * 100);

  return (
    <div className="app-wrap">
    <div className="app">
      {screen === "intro" && (
        <div className="screen active intro-screen">
          <div className="intro-copy">
            <p className="eyebrow">Positive Mind Care</p>
            <h1 className="title">Take the 2-minute Mind Check</h1>
            <p className="sub">
              20 quick questions. No right or wrong answers — just tap what feels true. At the end, get your personal Mental Wellness
              Score and what to do about it.
            </p>
          </div>
          <div className="intro-cta">
            <ul className="intro-points">
              <li>Takes under 2 minutes</li>
              <li>Covers stress, sleep, focus, mood &amp; balance</li>
              <li>Completely private — nothing is shared</li>
              <li>Get a personalised score and next step</li>
            </ul>
            <Link href="/mind-check" className="btn">
              Start My Mind Check
            </Link>
            <div className="fine">Used by 40,000+ people so far</div>
          </div>
        </div>
      )}
      {screen === "quiz" && (
        <div className="screen active">
          <div className="progress-wrap" style={{ padding: "0 0 18px" }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="progress-label">
              Question {current + 1} of {QUESTIONS.length}
            </div>
          </div>
          <div className="q-wrap">
            <div className="q-num">
              Question {current + 1} of {QUESTIONS.length}
            </div>
            <div className="q-text">{question.text}</div>
            <div className="options">
              {question.options.map((option) => (
                <button
                  key={option.label}
                  className={`opt-btn${question.type === "yesno" ? " yesno" : ""}`}
                  onClick={() => selectAnswer(option.points)}
                >
                  {question.type === "yesno" ? (
                    <>
                      <span>{option.label}</span>
                      <span className="opt-arrow">&rarr;</span>
                    </>
                  ) : (
                    option.label
                  )}
                </button>
              ))}
            </div>
          </div>
          <button className="q-back" style={{ visibility: current === 0 ? "hidden" : "visible" }} onClick={goBack}>
            &larr; Back
          </button>
        </div>
      )}

      {screen === "loading" && (
        <div className="screen active">
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">Calculating your Mind Score…</div>
            <div className="loading-sub">Analysing your {QUESTIONS.length} responses</div>
          </div>
        </div>
      )}

      {screen === "paywall" && (
        <div className="screen active">
          <div className="pw-head">
            <span className="pw-badge">Your results are ready</span>
            <div className="pw-title">Your Mind Score is calculated. Choose a plan to unlock your full report.</div>
            <p className="pw-sub">
              Every plan includes your personalised score, category, and a clear next step — picked by real counsellors, not a
              generic PDF.
            </p>
          </div>

          <div className="score-teaser">
            <div className="blur-score">{overallPercent}</div>
            <div className="teaser-label">Your score is hidden until you pick a plan</div>
          </div>

          <div className="pkg-list">
            {PACKAGES.map((pkg) => {
              const isRecommended = pkg.id === recommendedId;
              const flagText = isRecommended ? "Recommended for you" : pkg.flag;
              const highlightClass = isRecommended ? "recommended" : pkg.highlight === "elite" ? "elite" : "";
              return (
              <div key={pkg.id} className={`pkg${highlightClass ? ` ${highlightClass}` : ""}`} onClick={() => pickPackage(pkg)}>
                <div>
                  <div className="pkg-name-row">
                    <span className="pkg-name">{pkg.name}</span>
                    {flagText && <span className="pkg-flag">{flagText}</span>}
                  </div>
                  <div className="pkg-desc">{pkg.description}</div>
                </div>
                <div className="pkg-price-col">
                  <div className="pkg-price">{formatINR(pkg.price)}</div>
                  <div className="pkg-period">{pkg.period}</div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {screen === "checkout" && selectedPackage && (
        <div className="screen active checkout-screen">
          <p className="eyebrow eyebrow-on-dark">Almost there</p>
          <h1 className="title title-on-dark" style={{ fontSize: "26px" }}>
            Confirm your details
          </h1>
          <div className="checkout-summary">
            <span>{selectedPackage.name} package</span>
            <strong>{formatINR(selectedPackage.price)}</strong>
          </div>
          {checkoutError && <p className="field-error">{checkoutError}</p>}
          <form className="checkout-form" onSubmit={submitCheckout}>
            <div className="checkout-row">
              <div className="field">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" placeholder="Enter your name" required value={checkout.name} onChange={(e) => setCheckout({ ...checkout, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Phone number</label>
                <input id="co-phone" placeholder="Ex. +91 90128 34578" required value={checkout.phone} onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-email">Email address</label>
              <input id="co-email" type="email" placeholder="Enter your email" required value={checkout.email} onChange={(e) => setCheckout({ ...checkout, email: e.target.value })} />
            </div>
            <div className="checkout-row">
              <div className="field">
                <label htmlFor="co-age">Age</label>
                <input id="co-age" type="number" min={1} placeholder="Your age" value={checkout.age} onChange={(e) => setCheckout({ ...checkout, age: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="co-city">City</label>
                <input id="co-city" placeholder="Your city" required value={checkout.city} onChange={(e) => setCheckout({ ...checkout, city: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-gender">Gender (optional)</label>
              <select id="co-gender" value={checkout.gender} onChange={(e) => setCheckout({ ...checkout, gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="consent consent-on-dark">
              <input type="checkbox" checked={checkout.consent} onChange={(e) => setCheckout({ ...checkout, consent: e.target.checked })} />
              I agree to be contacted about my Mind Check result and booking.
            </label>
            <button className="btn btn-gold" type="submit" disabled={submitting}>
              {submitting ? "Processing…" : `Pay ${formatINR(selectedPackage.price)} & Unlock`}
            </button>
            <button type="button" className="btn ghost ghost-on-dark" onClick={skipToResult} disabled={submitting}>
              Skip payment and see your result
            </button>
          </form>
        </div>
      )}

      {screen === "result" && (
        <div className="screen active">
          <div className="res-head">
            <span className={`res-tone-badge tone-${band.tone}`}>Your Mind Check Result</span>
            {unlocked && selectedPackage && <div className="res-eyebrow">{selectedPackage.name} Package selected</div>}
            <div className="res-band">{band.band}</div>
          </div>

          <div className="score-ring-wrap">
            <svg viewBox="0 0 120 120" className="score-ring" role="img" aria-label={`Score ${overallPercent} out of 100`}>
              <circle cx="60" cy="60" r={RING_RADIUS} className="score-ring-track" />
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                className={`score-ring-fill tone-${band.tone}`}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - overallPercent / 100)}
              />
            </svg>
            <div className="score-ring-label">
              <span className="score-num">{overallPercent}</span>
              <span className="score-max">/ 100</span>
            </div>
          </div>

          <div className="res-block">
            <div className="res-block-label">What this means</div>
            <p style={{ fontSize: "14px", color: "var(--ink)" }}>{band.meaning}</p>
          </div>

          <div className="res-block">
            <div className="res-block-label">Your wellbeing breakdown</div>
            <div className="dim-list">
              {dimensions.map((dimension) => (
                <div className="dim-row" key={dimension.id}>
                  <div className="dim-row-top">
                    <span>{dimension.label}</span>
                    <span className={`dim-level level-${dimension.level}`}>{levelLabels[dimension.level]}</span>
                  </div>
                  <div className="dim-track">
                    <div className={`dim-fill level-${dimension.level}`} style={{ width: `${dimension.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="res-block">
            <div className="res-block-label">Recommended next steps</div>
            <ul className="res-list check">
              {band.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="res-quote">{band.quote}</div>

          {unlocked && (
            <div className="res-cta-block">
              <div className="res-cta-title">{ctaLabel?.title ?? "Start today"}</div>
              <div className="res-cta-sub">{ctaLabel?.sub ?? "Your first session can be booked in under a minute."}</div>
              <button className="res-cta-btn" onClick={handleConfirmBook}>
                {ctaLabel?.button ?? "Continue"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
