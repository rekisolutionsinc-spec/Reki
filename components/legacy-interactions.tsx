"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

type LegacyModalState = { title: string; text: string } | null;

function getEventElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function setDonationStatus(message: string) {
  const formColumn = document.querySelector<HTMLElement>(".don-form-col");
  if (!formColumn) return;
  let status = formColumn.querySelector<HTMLElement>("[data-donation-status]");
  if (!status) {
    status = document.createElement("p");
    status.dataset.donationStatus = "true";
    status.setAttribute("role", "alert");
    status.setAttribute("aria-live", "assertive");
    formColumn.append(status);
  }
  status.textContent = message;
}

function updateLegacyDonationSummary() {
  const formColumn = document.querySelector<HTMLElement>(".don-form-col");
  if (!formColumn) return;
  const amount = Number(formColumn.dataset.donationAmount ?? 0);
  const symbol = formColumn.dataset.donationSymbol ?? "GH₵";
  const currency = formColumn.dataset.donationCurrency ?? "GHS";
  const frequency = formColumn.dataset.donationFrequency ?? "once";
  const frequencyLabel = frequency === "once" ? "One-time gift" : frequency === "annually" ? "Annual giving" : "Monthly giving";
  const amountLabel = formColumn.querySelector<HTMLElement>("#summaryAmt");
  const frequencyLabelNode = formColumn.querySelector<HTMLElement>("#summaryFreq");
  const payButton = formColumn.querySelector<HTMLButtonElement>("#donPayBtn");
  const agreement = formColumn.querySelector<HTMLInputElement>("#donAgree");
  if (amountLabel) amountLabel.textContent = amount > 0 ? `${symbol}${amount.toLocaleString()}` : "—";
  if (frequencyLabelNode) frequencyLabelNode.textContent = frequencyLabel;
  if (payButton) payButton.disabled = !(agreement?.checked && amount > 0);
  formColumn.dataset.donationCurrency = currency;
}

function setHomepageDonationStatus(form: HTMLFormElement, message: string, role: "status" | "alert" = "status") {
  let status = form.querySelector<HTMLElement>("[data-home-donation-status]");
  if (!status) {
    status = document.createElement("p");
    status.dataset.homeDonationStatus = "true";
    status.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
    status.className = "home-donation-status";
    form.append(status);
  }
  status.setAttribute("role", role);
  status.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
  status.textContent = message;
}

export function LegacyInteractions() {
  const [modal, setModal] = useState<LegacyModalState>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counterFrames = new Set<number>();
    const impactBand = document.querySelector<HTMLElement>(".home-impact-band");
    let impactObserver: IntersectionObserver | undefined;

    function animateCounter(counter: HTMLElement, target: number) {
      const startedAt = performance.now();
      const duration = 1800;
      let frame = 0;
      const updateCounter = (now: number) => {
        counterFrames.delete(frame);
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target).toLocaleString("en");
        if (progress < 1) {
          frame = requestAnimationFrame(updateCounter);
          counterFrames.add(frame);
        }
      };
      frame = requestAnimationFrame(updateCounter);
      counterFrames.add(frame);
    }

    if (impactBand) {
      const counters = Array.from(impactBand.querySelectorAll<HTMLElement>(".counter[data-target]"));
      const finishCounters = () => counters.forEach((counter) => {
        const target = Number(counter.dataset.target);
        if (Number.isFinite(target)) counter.textContent = target.toLocaleString("en");
      });

      if (reducedMotion || !("IntersectionObserver" in window)) {
        impactBand.classList.add("is-visible");
        finishCounters();
      } else {
        impactBand.classList.add("has-motion");
        impactObserver = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          impactBand.classList.add("is-visible");
          impactObserver?.disconnect();
          counters.forEach((counter) => {
            const target = Number(counter.dataset.target);
            if (!Number.isFinite(target)) return;
            counter.textContent = "0";
            animateCounter(counter, target);
          });
        }, { threshold: 0.2 });
        impactObserver.observe(impactBand);
      }
    }

    const carousel = document.querySelector<HTMLElement>(".hero-slider");
    const slides = Array.from(carousel?.querySelectorAll<HTMLElement>(".swiper-slide") ?? []);
    let activeSlide = 0;
    let cleanupCarousel = () => {};
    let carouselInterval: number | undefined;

    if (carousel && slides.length > 1) {
      const activeCarousel = carousel;
      let typingInterval: number | undefined;
      const typedTitles = slides.map((slide) => {
        const heading = slide.querySelector<HTMLElement>("h1");
        if (!heading) return null;
        const text = heading.textContent?.trim() ?? "";
        const typedText = document.createElement("span");
        typedText.className = "hero-title-text";
        typedText.setAttribute("aria-hidden", "true");
        heading.setAttribute("aria-label", text);
        heading.replaceChildren(typedText);
        return { text, typedText };
      });

      activeCarousel.setAttribute("role", "region");
      activeCarousel.setAttribute("aria-roledescription", "carousel");
      activeCarousel.setAttribute("aria-label", "Spursbase Foundation highlights");
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === 0);
        slide.setAttribute("aria-hidden", String(index !== 0));
      });

      function showSlide(nextIndex: number) {
        const next = (nextIndex + slides.length) % slides.length;
        if (next === activeSlide) return;
        activeSlide = next;
        slides.forEach((slide, index) => {
          const isActive = index === next;
          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
        });
        typeHeading(next);
      }

      function typeHeading(index: number) {
        if (typingInterval !== undefined) {
          window.clearInterval(typingInterval);
          typingInterval = undefined;
        }
        const title = typedTitles[index];
        if (!title) return;

        title.typedText.textContent = "";
        if (reducedMotion) {
          title.typedText.textContent = title.text;
          return;
        }

        let character = 0;
        typingInterval = window.setInterval(() => {
          character += 1;
          title.typedText.textContent = title.text.slice(0, character);
          if (character >= title.text.length && typingInterval !== undefined) {
            window.clearInterval(typingInterval);
            typingInterval = undefined;
          }
        }, 38);
      }

      function pauseCarousel() {
        if (carouselInterval !== undefined) {
          window.clearInterval(carouselInterval);
          carouselInterval = undefined;
        }
      }

      function startCarousel() {
        pauseCarousel();
        if (document.hidden) return;
        carouselInterval = window.setInterval(() => showSlide(activeSlide + 1), 3000);
      }

      function handleVisibilityChange() {
        if (document.hidden) pauseCarousel();
        else startCarousel();
      }

      activeCarousel.addEventListener("keydown", handleCarouselArrowKeys);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      function handleCarouselArrowKeys(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
        if (event.key === "ArrowRight") showSlide(activeSlide + 1);
      }
      activeCarousel.dataset.carouselReady = "true";
      typeHeading(activeSlide);
      startCarousel();
      cleanupCarousel = () => {
        pauseCarousel();
        if (typingInterval !== undefined) window.clearInterval(typingInterval);
        activeCarousel.removeEventListener("keydown", handleCarouselArrowKeys);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        delete activeCarousel.dataset.carouselReady;
      };
    }

    const hoverTargets = ".what-we-do-card, .project-card, .about-box, .program-card, .news-card";
    function handleCardPointerOver(event: PointerEvent) {
      if (reducedMotion) return;
      const target = getEventElement(event.target)?.closest<HTMLElement>(hoverTargets);
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      animate(target, { y: -5 }, { type: "spring", stiffness: 100, damping: 15 });
    }
    function handleCardPointerOut(event: PointerEvent) {
      if (reducedMotion) return;
      const target = getEventElement(event.target)?.closest<HTMLElement>(hoverTargets);
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      animate(target, { y: 0 }, { type: "spring", stiffness: 100, damping: 15 });
    }

    document.addEventListener("pointerover", handleCardPointerOver);
    document.addEventListener("pointerout", handleCardPointerOut);

    async function handleClick(event: MouseEvent) {
      const element = getEventElement(event.target);
      const control = element?.closest<HTMLElement>("[data-legacy-toggle], [data-legacy-panel], [data-legacy-step], [data-legacy-modal-title], [data-legacy-story], [data-legacy-frequency], [data-legacy-currency], [data-legacy-amount-index], [data-legacy-custom-trigger], [data-legacy-update-pay], [data-legacy-donate], [data-legacy-skip-payment]");
      if (!control) return;

      const donationColumn = document.querySelector<HTMLElement>(".don-form-col");
      const frequency = control.dataset.legacyFrequency;
      if (frequency && donationColumn) {
        donationColumn.dataset.donationFrequency = frequency;
        document.querySelectorAll<HTMLElement>("[data-legacy-frequency]").forEach((button) => {
          const selected = button === control;
          button.classList.toggle("active", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
        const note = document.querySelector<HTMLElement>("#freqNote");
        const notes: Record<string, string> = {
          once: "A one-time gift helps us respond to immediate needs in the community.",
          monthly: "Monthly giving provides predictable support so we can plan long-term programmes.",
          annually: "An annual gift makes a significant difference and qualifies for our partnership acknowledgement.",
        };
        if (note) note.textContent = notes[frequency] ?? "";
        updateLegacyDonationSummary();
      }

      const currency = control.dataset.legacyCurrency;
      if (currency && donationColumn) {
        const symbol = control.dataset.legacySymbol ?? "GH₵";
        const amounts = (control.dataset.legacyAmounts ?? "").split(",").map(Number).filter(Number.isFinite);
        donationColumn.dataset.donationCurrency = currency;
        donationColumn.dataset.donationSymbol = symbol;
        donationColumn.dataset.donationAmounts = amounts.join(",");
        donationColumn.dataset.donationAmount = "0";
        document.querySelectorAll<HTMLElement>("[data-legacy-currency]").forEach((button) => {
          const selected = button === control;
          button.classList.toggle("active", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
        amounts.forEach((amount, index) => {
          const button = document.getElementById(`amt${index}`);
          if (button) button.textContent = `${symbol}${amount.toLocaleString()}`;
        });
        document.querySelectorAll<HTMLElement>(".don-amt-btn").forEach((button) => button.classList.remove("active"));
        const customRow = document.querySelector<HTMLElement>("#customRow");
        if (customRow) customRow.style.display = "none";
        const symbolLabel = document.querySelector<HTMLElement>("#symLabel");
        if (symbolLabel) symbolLabel.textContent = symbol;
        updateLegacyDonationSummary();
      }

      const amountIndex = Number(control.dataset.legacyAmountIndex);
      if (Number.isInteger(amountIndex) && donationColumn) {
        const amounts = (donationColumn.dataset.donationAmounts ?? "50,100,250,500,1000").split(",").map(Number);
        donationColumn.dataset.donationAmount = String(amounts[amountIndex] ?? 0);
        document.querySelectorAll<HTMLElement>(".don-amt-btn").forEach((button) => button.classList.toggle("active", button === control));
        updateLegacyDonationSummary();
      }

      if (control.dataset.legacyCustomTrigger && donationColumn) {
        donationColumn.dataset.donationAmount = "0";
        const customRow = document.querySelector<HTMLElement>("#customRow");
        if (customRow) customRow.style.display = "flex";
        document.querySelectorAll<HTMLElement>(".don-amt-btn").forEach((button) => button.classList.toggle("active", button === control));
        document.querySelector<HTMLInputElement>("#customAmt")?.focus();
        updateLegacyDonationSummary();
      }

      if (control.dataset.legacyUpdatePay) updateLegacyDonationSummary();

      if (control.dataset.legacySkipPayment) {
        const donePanel = document.querySelector<HTMLElement>("#step-5");
        if (donePanel) {
          document.querySelectorAll<HTMLElement>(".vr-step-panel").forEach((panel) => {
            panel.hidden = panel !== donePanel;
            panel.classList.toggle("active", panel === donePanel);
          });
          donePanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      if (control.dataset.legacyDonate && donationColumn) {
        const currencyCode = donationColumn.dataset.donationCurrency ?? "GHS";
        if (currencyCode !== "GHS") {
          setDonationStatus("Online checkout currently accepts GHS. Please choose GHS or contact info@spursbasefoundation.org for another currency.");
          return;
        }
        const firstName = document.querySelector<HTMLInputElement>("#donFirst")?.value.trim() ?? "";
        const lastName = document.querySelector<HTMLInputElement>("#donLast")?.value.trim() ?? "";
        const email = document.querySelector<HTMLInputElement>("#donEmail")?.value.trim() ?? "";
        const agreed = document.querySelector<HTMLInputElement>("#donAgree")?.checked;
        if (!firstName || !lastName || !email || !agreed) {
          setDonationStatus("Enter your name and email, choose an amount, and agree to make this donation.");
          return;
        }
        const amount = Number(donationColumn.dataset.donationAmount ?? 0);
        const payButton = document.querySelector<HTMLButtonElement>("#donPayBtn");
        if (payButton) payButton.disabled = true;
        try {
          const response = await fetch("/api/donations/initialize", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              fullName: `${firstName} ${lastName}`,
              email,
              amount,
              frequency: (donationColumn.dataset.donationFrequency === "once" ? "one-time" : donationColumn.dataset.donationFrequency) ?? "one-time",
            }),
          });
          const result: { authorizationUrl?: string; error?: string } = await response.json();
          if (!response.ok || !result.authorizationUrl) {
            setDonationStatus(result.error ?? "We could not start your donation. Please try again.");
            return;
          }
          window.location.assign(result.authorizationUrl);
        } catch {
          setDonationStatus("The payment service is temporarily unavailable. Please try again.");
        } finally {
          if (payButton) payButton.disabled = false;
        }
      }

      const toggleClass = control.dataset.legacyToggle;
      if (toggleClass) {
        const expanded = control.classList.toggle(toggleClass);
        control.setAttribute("aria-expanded", String(expanded));
      }

      const panelId = control.dataset.legacyPanel;
      if (panelId) {
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
          const panelSelector = panelId.startsWith("pane-") ? '[id^="pane-"]' : ".prg-section";
          document.querySelectorAll<HTMLElement>(panelSelector).forEach((panel) => {
            const active = panel === targetPanel;
            panel.hidden = !active;
            panel.classList.toggle("active", active);
            if (panel.matches(".prg-section")) panel.classList.toggle("prg-section--active", active);
          });
          document.querySelectorAll<HTMLElement>("[data-legacy-panel]").forEach((tab) => {
            const active = tab.dataset.legacyPanel === panelId;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
          });
        }
      }

      const step = Number(control.dataset.legacyStep);
      const flow = control.dataset.legacyFlow;
      if (Number.isInteger(step) && step > 0 && (flow === "vr" || flow === "gr")) {
        const panels = Array.from(document.querySelectorAll<HTMLElement>(`.${flow}-step-panel`));
        const currentPanel = panels.find((panel) => panel.classList.contains("active"));
        if (step > 1 && currentPanel) {
          const invalidField = Array.from(currentPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]"))
            .find((field) => !field.checkValidity());
          if (invalidField) {
            invalidField.reportValidity();
            return;
          }
        }
        panels.forEach((panel) => {
          const active = panel.id === `step-${step}`;
          panel.classList.toggle("active", active);
          panel.hidden = !active;
        });
        document.querySelectorAll<HTMLElement>(`.${flow}-progress-step`).forEach((progress) => {
          const progressStep = Number(progress.dataset.step);
          const active = progressStep === step;
          progress.classList.toggle("active", active);
          if (active) progress.setAttribute("aria-current", "step");
          else progress.removeAttribute("aria-current");
        });
        document.querySelector("main")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      const title = control.dataset.legacyModalTitle;
      if (title) setModal({ title, text: control.dataset.legacyModalText ?? "" });
      const storyId = control.dataset.legacyStory;
      if (storyId) {
        const story = control.closest<HTMLElement>(".blog-card, article, .featured-blog") ?? control.parentElement;
        const storyTitle = story?.querySelector("h2, h3, h4")?.textContent?.trim() ?? control.textContent?.trim() ?? "Story";
        const storyText = story?.querySelector("p")?.textContent?.trim() ?? "";
        setModal({ title: storyTitle, text: storyText });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModal(null);
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      const element = getEventElement(event.target);
      const control = element?.closest<HTMLElement>('[role="button"][data-legacy-toggle], [role="tab"][data-legacy-panel], [data-legacy-modal-title], [data-legacy-story]');
      if (!control || control instanceof HTMLButtonElement || control instanceof HTMLAnchorElement) return;
      event.preventDefault();
      control.click();
    }

    function handleInput(event: Event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches("[data-legacy-custom-input]")) return;
      const formColumn = document.querySelector<HTMLElement>(".don-form-col");
      if (!formColumn) return;
      formColumn.dataset.donationAmount = String(Number(input.value) || 0);
      updateLegacyDonationSummary();
    }

    function handleChange(event: Event) {
      const element = getEventElement(event.target);
      if (element?.closest("[data-legacy-update-pay]")) updateLegacyDonationSummary();
    }

    function handleContactSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.id !== "contactForm") return;
      event.preventDefault();
      const invalidField = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]"))
        .find((field) => !field.checkValidity());
      if (invalidField) {
        invalidField.reportValidity();
        return;
      }

      const getValue = (id: string) => form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`)?.value.trim() ?? "";
      const subject = `Website inquiry: ${getValue("cfReason")}`;
      const body = [
        `Name: ${getValue("cfName")}`,
        `Email: ${getValue("cfEmail")}`,
        `Phone: ${getValue("cfPhone") || "Not provided"}`,
        `Reason: ${getValue("cfReason")}`,
        "",
        getValue("cfMessage"),
      ].join("\n");
      const mailto = `mailto:info@spursbasefoundation.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      let status = form.querySelector<HTMLElement>("[data-contact-fallback]");
      if (!status) {
        status = document.createElement("p");
        status.dataset.contactFallback = "true";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        form.append(status);
      }
      status.replaceChildren("Your email app can send this message. ");
      const link = document.createElement("a");
      link.href = mailto;
      link.textContent = "Open email draft";
      status.append(link, ". If that does not work, email info@spursbasefoundation.org.");
    }

    function handleNewsletterSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches(".newsletter-form")) return;
      event.preventDefault();
      if (!form.reportValidity()) return;

      const email = form.querySelector<HTMLInputElement>('input[type="email"]')?.value.trim();
      if (!email) return;
      const subject = encodeURIComponent("Newsletter subscription");
      const body = encodeURIComponent(`Please add ${email} to the Spursbase Foundation newsletter.`);
      const mailto = `mailto:info@spursbasefoundation.org?subject=${subject}&body=${body}`;
      let status = form.querySelector<HTMLElement>("[data-newsletter-status]");
      if (!status) {
        status = document.createElement("p");
        status.dataset.newsletterStatus = "true";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        form.append(status);
      }
      status.replaceChildren("Newsletter sign-up is not connected yet. ");
      const link = document.createElement("a");
      link.href = mailto;
      link.textContent = "Email us to subscribe";
      status.append(link, ".");
    }

    async function handleHomepageDonationSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.id !== "donateForm") return;
      event.preventDefault();
      if (!form.reportValidity()) return;

      const submitButton = form.querySelector<HTMLButtonElement>('[type="submit"]');
      const originalText = submitButton?.textContent ?? "Donate";
      const fullName = form.querySelector<HTMLInputElement>("#fullName")?.value.trim() ?? "";
      const email = form.querySelector<HTMLInputElement>("#email")?.value.trim() ?? "";
      const amount = Number(form.querySelector<HTMLInputElement>("#amount")?.value);
      const frequency = form.querySelector<HTMLSelectElement>("#recurring")?.value ?? "one-time";
      if (!Number.isSafeInteger(amount) || amount < 1) {
        setHomepageDonationStatus(form, "Enter a whole-number donation amount greater than zero.", "alert");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Preparing donation…";
      }
      setHomepageDonationStatus(form, "Preparing your secure donation…");
      try {
        const response = await fetch("/api/donations/initialize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fullName, email, amount, frequency }),
        });
        const result = await response.json() as { authorizationUrl?: string; error?: string };
        if (!response.ok || !result.authorizationUrl) {
          setHomepageDonationStatus(form, result.error ?? "We could not start your donation. Please try again.", "alert");
          return;
        }
        window.location.assign(result.authorizationUrl);
      } catch {
        setHomepageDonationStatus(form, "We could not reach the payment service. Please try again later.", "alert");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleContactSubmit);
    document.addEventListener("submit", handleNewsletterSubmit);
    document.addEventListener("submit", handleHomepageDonationSubmit);
    return () => {
      counterFrames.forEach((frame) => cancelAnimationFrame(frame));
      impactObserver?.disconnect();
      cleanupCarousel();
      document.removeEventListener("pointerover", handleCardPointerOver);
      document.removeEventListener("pointerout", handleCardPointerOut);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("input", handleInput);
      document.removeEventListener("change", handleChange);
      document.removeEventListener("submit", handleContactSubmit);
      document.removeEventListener("submit", handleNewsletterSubmit);
      document.removeEventListener("submit", handleHomepageDonationSubmit);
    };
  }, []);

  if (!modal) return null;
  return (
    <div className="legacy-modal-backdrop" role="presentation" onClick={() => setModal(null)}>
      <section className="legacy-modal" role="dialog" aria-modal="true" aria-labelledby="legacy-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="legacy-modal__close" type="button" aria-label="Close dialog" onClick={() => setModal(null)}>×</button>
        <p className="eyebrow">Spursbase Programme</p>
        <h2 id="legacy-modal-title">{modal.title}</h2>
        <p>{modal.text}</p>
        <button className="button button--dark" type="button" onClick={() => setModal(null)}>Close</button>
      </section>
    </div>
  );
}