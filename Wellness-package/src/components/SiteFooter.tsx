import Image from "next/image";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Image src="/logo-mark.png" alt={site.brand} width={92} height={46} className="site-footer-logo" />
          <p className="site-footer-name">{site.brand}</p>
          <p className="site-footer-tagline">Mental wellness check-ins &amp; counselling support, backed by real counsellors.</p>
        </div>

        <div className="site-footer-col">
          <p className="site-footer-heading">Quick Links</p>
          <Link href="/">Take the Mind Check</Link>
          <Link href="/enquire">CGHS / CSR Enquiries</Link>
        </div>

        <div className="site-footer-col">
          <p className="site-footer-heading">Get in Touch</p>
          <a href={`tel:+91${site.phoneDigits}`}>{site.phone}</a>
          <a href={whatsappLink(`Namaste, I'd like to know more about ${site.brand}.`, `91${site.phoneDigits}`)} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>

        <div className="site-footer-col">
          <p className="site-footer-heading">Address</p>
          <p className="site-footer-address">{site.address}</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>
          © {year} {site.brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
