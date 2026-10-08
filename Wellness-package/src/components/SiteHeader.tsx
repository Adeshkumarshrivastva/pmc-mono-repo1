import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function SiteHeader({ note }: { note?: string }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-brand">
          <Image src="/logo-header.png" alt={site.brand} width={173} height={58} className="site-header-logo" priority />
        </Link>
        <span className="site-header-center">{note ? note : "Mind Check"}</span>
      </div>
    </header>
  );
}
