import Image from "next/image";
import Link from "next/link";
import parse, { attributesToProps, domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { createElement, type ReactNode } from "react";
import { LegacyInteractions } from "@/components/legacy-interactions";
import { legacyImageUrl, rewriteLegacyCssImages } from "@/lib/legacy-assets";

function blurPlaceholder(source: string) {
  let hash = 0;
  for (const character of source) hash = (hash * 31 + character.charCodeAt(0)) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="20"><filter id="b"><feGaussianBlur stdDeviation="6"/></filter><rect width="32" height="20" fill="hsl(${hash} 30% 80%)" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function normalizeLink(href: string) {
  const trimmed = href.trim();
  if (!trimmed || /^(?:javascript|vbscript|data):/i.test(trimmed)) return "#";
  if (/^\/legacy-assets\/documents\//i.test(trimmed)) return trimmed;
  if (/^(?:https?:|mailto:|tel:|sms:)/i.test(trimmed) || trimmed.startsWith("#")) return trimmed;

  const [pathname, suffix = ""] = trimmed.split(/(?=[?#])/, 2);
  const normalizedPath = pathname
    .replace(/^(?:\.\.\/|\.\/)+/, "")
    .replace(/^\/?pages\//i, "")
    .replace(/^\//, "")
    .replace(/\.html$/i, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .join("/");

  if (!normalizedPath || normalizedPath === "index") return `/${suffix}`;
  return `/${normalizedPath}${suffix}`;
}

function isElement(node: DOMNode): node is Element {
  return node instanceof Element;
}

function hasHeroAncestor(node: Element) {
  let parent = node.parent;
  while (parent) {
    if (parent instanceof Element && /hero|banner/i.test(parent.attribs.class ?? "")) return true;
    parent = parent.parent;
  }
  return false;
}

function containsHeroCopy(node: Element): boolean {
  return node.children.some((child) => {
    if (child.type === "text") return Boolean(child.data.trim());
    return child instanceof Element && containsHeroCopy(child);
  });
}

export function LegacyPage({ html, stylesheets = [] }: { html: string; stylesheets?: string[] }) {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!isElement(node)) return;

      const tag = node.name.toLowerCase();
      if (tag === "style") {
        const css = node.children
          .filter((child) => child.type === "text")
          .map((child) => child.data)
          .join("");
        return createElement("style", attributesToProps(node.attribs), rewriteLegacyCssImages(css));
      }
      if (tag === "head") return <>{domToReact(node.children as DOMNode[], options)}</>;
      if (["script", "link", "meta", "title", "my-header", "my-footer"].includes(tag)) return <></>;
      if (["html", "body", "main"].includes(tag)) return <>{domToReact(node.children as DOMNode[], options)}</>;

      const hasHeroClass = /hero|banner/i.test(node.attribs.class ?? "");
      if (hasHeroClass && !hasHeroAncestor(node)) {
        node.attribs["data-site-hero"] = "true";
      } else if (
        node.parent instanceof Element
        && node.parent.attribs["data-site-hero"] === "true"
        && !/slider/i.test(node.parent.attribs.class ?? "")
        && !["h1", "h2", "h3", "p", "a", "button", "span"].includes(tag)
        && containsHeroCopy(node)
      ) {
        node.attribs["data-site-hero-content"] = "true";
      }

      const inlineClick = [node.attribs.onclick, node.attribs.onchange, node.attribs.oninput].filter(Boolean).join(";");
      const navigationMatch = inlineClick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
      if (navigationMatch) {
        const href = normalizeLink(navigationMatch[1]);
        const safeAttributes = Object.fromEntries(Object.entries(node.attribs).filter(([name]) => !name.toLowerCase().startsWith("on")));
        const props = attributesToProps({ ...safeAttributes, href });
        return <Link {...props} href={href}>{domToReact(node.children as DOMNode[], options)}</Link>;
      }

      const toggleMatch = inlineClick.match(/this\.classList\.toggle\(['"]([^'"]+)['"]\)/i);
      const panelMatch = inlineClick.match(/(?:\w+Show(?:Section)?|showTab)\s*\(\s*['"]([^'"]+)['"]/i);
      const stepMatch = inlineClick.match(/goStep\s*\(\s*(\d+)\s*\)/i);
      const modalMatch = inlineClick.match(/prgCardClick\s*\(\s*event\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/i);
      const storyMatch = inlineClick.match(/openStory\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
      const frequencyMatch = inlineClick.match(/setFreq\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*\)/i);
      const currencyMatch = inlineClick.match(/setCurrency\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*([\d,\s]+)\)/i);
      const amountMatch = inlineClick.match(/selectAmt\s*\(\s*this\s*,\s*(\d+)\s*\)/i);
      const fixedDonationMatch = inlineClick.match(/selectDonation\s*\(\s*this\s*,\s*(\d+(?:\.\d+)?)\s*\)/i);

      for (const name of Object.keys(node.attribs)) {
        if (name.toLowerCase().startsWith("on")) delete node.attribs[name];
      }
      if (toggleMatch) {
        node.attribs["data-legacy-toggle"] = toggleMatch[1];
        node.attribs.role ??= "button";
        node.attribs.tabindex ??= "0";
        node.attribs["aria-expanded"] = String(!node.attribs.class?.includes(toggleMatch[1]));
      }
      if (panelMatch) {
        node.attribs["data-legacy-panel"] = panelMatch[1];
        node.attribs.role ??= "tab";
        node.attribs.tabindex ??= "0";
      }
      if (stepMatch) {
        node.attribs["data-legacy-step"] = stepMatch[1];
        node.attribs["data-legacy-flow"] = node.attribs.class?.match(/\b(vr|gr)-btn-/)?.[1] ?? "";
      }
      if (modalMatch) {
        node.attribs["data-legacy-modal-title"] = modalMatch[1];
        node.attribs["data-legacy-modal-text"] = modalMatch[2];
        node.attribs.role ??= "button";
        node.attribs.tabindex ??= "0";
      }
      if (storyMatch) {
        node.attribs["data-legacy-story"] = storyMatch[1];
      }
      if (frequencyMatch) {
        node.attribs["data-legacy-frequency"] = frequencyMatch[1];
        node.attribs["aria-pressed"] = String(node.attribs.class?.includes("active"));
      }
      if (currencyMatch) {
        node.attribs["data-legacy-currency"] = currencyMatch[1];
        node.attribs["data-legacy-symbol"] = currencyMatch[2];
        node.attribs["data-legacy-amounts"] = currencyMatch[3].split(",").map((amount) => amount.trim()).filter(Boolean).join(",");
      }
      if (amountMatch) node.attribs["data-legacy-amount-index"] = amountMatch[1];
      if (fixedDonationMatch) node.attribs["data-legacy-fixed-donation"] = fixedDonationMatch[1];
      if (/showCustom\s*\(/i.test(inlineClick)) node.attribs["data-legacy-custom-trigger"] = "true";
      if (/setCustom\s*\(/i.test(inlineClick)) node.attribs["data-legacy-custom-input"] = "true";
      if (/updatePayBtn\s*\(/i.test(inlineClick)) node.attribs["data-legacy-update-pay"] = "true";
      if (/submitDonation\s*\(/i.test(inlineClick)) node.attribs["data-legacy-donate"] = "true";
      if (/skipPayment\s*\(/i.test(inlineClick)) node.attribs["data-legacy-skip-payment"] = "true";

      const styleAttribute = node.attribs.style ?? "";
      const backgroundMatch = styleAttribute.match(/(?:background-image|background)\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
      const backgroundSource = backgroundMatch ? legacyImageUrl(backgroundMatch[2]) : null;
      if (backgroundSource && backgroundMatch) {
        const remainingStyle = styleAttribute.replace(backgroundMatch[0], "").trim();
        const props = attributesToProps({ ...node.attribs, style: remainingStyle });
        const existingClassName = typeof props.className === "string" ? props.className : "";
        props.className = `${existingClassName} legacy-has-background`.trim();
        const children = domToReact(node.children as DOMNode[], options);
        const isHero = /hero|banner/i.test(node.attribs.class ?? "");
        return createElement(
          tag,
          props,
          <>
            <Image
              className="legacy-background-image"
              src={backgroundSource}
              alt=""
              fill
              priority={isHero}
              quality={80}
              placeholder="blur"
              blurDataURL={blurPlaceholder(backgroundSource)}
              sizes="100vw"
            />
            {isHero && <span className="legacy-background-overlay" aria-hidden="true" />}
            {children}
          </>,
        );
      }

      if (tag === "img") {
        const source = legacyImageUrl(node.attribs.src ?? "");
        if (!source) return <span className="legacy-image-missing" role="img" aria-label={node.attribs.alt ?? "Image unavailable"} />;
        const className = node.attribs.class;
        return (
          <Image
            className={className}
            src={source}
            alt={node.attribs.alt ?? ""}
            width={1200}
            height={800}
            quality={80}
            placeholder="blur"
            blurDataURL={blurPlaceholder(source)}
            sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 1200px"
            loading={node.attribs.loading === "eager" ? "eager" : "lazy"}
          />
        );
      }

      if (tag === "a") {
        const href = normalizeLink(node.attribs.href ?? "#");
        const children = domToReact(node.children as DOMNode[], options) as ReactNode;
        const props = attributesToProps({ ...node.attribs, href });
        if (href.startsWith("/")) return <Link {...props} href={href}>{children}</Link>;
        return <a {...props} href={href} target={href.startsWith("http") ? "_blank" : node.attribs.target} rel={href.startsWith("http") ? "noreferrer" : node.attribs.rel}>{children}</a>;
      }

      return undefined;
    },
  };

  return (
    <div className="legacy-page">
      {stylesheets.map((href) => <link key={href} rel="stylesheet" href={href} />)}
      {parse(html, options)}
      <LegacyInteractions />
    </div>
  );
}