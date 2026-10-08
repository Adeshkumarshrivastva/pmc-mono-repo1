import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { adminPassword, isAdmin } from "@/lib/admin-auth";
import { decodeAnswers, levelLabels, scoreAnswers } from "@/lib/assessment";
import { formatINR } from "@/lib/catalog";
import { ENQUIRY_TYPES, GENDER_OPTIONS, optionLabel } from "@/lib/customer";
import { razorpayKeys } from "@/lib/razorpay";
import { site, whatsappLink } from "@/lib/site";
import { readStore, type EnquiryRecord, type OrderRecord } from "@/lib/store";
import { login, logout, toggleContacted } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const VIEWS = [
  { id: "all", label: "All orders" },
  { id: "paid", label: "Paid" },
  { id: "created", label: "Unpaid checkouts" },
  { id: "failed", label: "Failed payments" },
  { id: "enquiries", label: "CGHS / CSR enquiries" },
] as const;

type View = (typeof VIEWS)[number]["id"];

const statusLabels: Record<OrderRecord["status"], string> = { paid: "Paid", created: "Unpaid", failed: "Failed" };

const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

function isView(value: unknown): value is View {
  return VIEWS.some((view) => view.id === value);
}

export default async function AdminPage(props: PageProps<"/admin">) {
  const params = await props.searchParams;

  if (!adminPassword()) {
    return (
      <AdminFrame>
        <div className="admin-login">
          <p className="eyebrow">Admin</p>
          <h1 className="admin-title">Almost there</h1>
          <p className="muted-copy">
            Add <code>ADMIN_PASSWORD=your-password</code> to <code>.env.local</code>, then reload this page.
          </p>
        </div>
      </AdminFrame>
    );
  }

  if (!(await isAdmin())) {
    return (
      <AdminFrame>
        <form action={login} className="admin-login">
          <p className="eyebrow">Admin</p>
          <h1 className="admin-title">Sign in</h1>
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
          {params.error === "1" && <p className="field-error">Incorrect password.</p>}
          <button className="button button-dark full" type="submit">
            Sign in <span>&rarr;</span>
          </button>
        </form>
      </AdminFrame>
    );
  }

  const data = await readStore().catch((error: unknown) => {
    console.error("[admin] read store failed:", error);
    return null;
  });
  if (!data) {
    return (
      <AdminFrame>
        <p className="form-alert">Could not read saved orders.</p>
      </AdminFrame>
    );
  }
  const view: View = isView(params.view) ? params.view : "all";
  const { orders, enquiries } = data;
  const paid = orders.filter((order) => order.status === "paid");
  const unpaid = orders.filter((order) => order.status === "created");
  const failed = orders.filter((order) => order.status === "failed");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const conversion = orders.length > 0 ? Math.round((paid.length / orders.length) * 100) : 0;
  const shownOrders = view === "all" ? orders : orders.filter((order) => order.status === view);

  return (
    <AdminFrame>
      <div className="admin-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-title">Leads &amp; orders</h1>
        </div>
        <div className="admin-head-actions">
          <a className="pill-button" href={`/api/admin/export?type=${view === "enquiries" ? "enquiries" : "orders"}`}>
            Export CSV File.
          </a>
          <form action={logout}>
            <button className="pill-button" type="submit">
              Log out
            </button>
          </form>
        </div>
      </div>

      {!razorpayKeys() && <p className="form-alert">Razorpay keys are not provided yet., so customers cannot pay yet.</p>}
      <div className="admin-stats">
        <Stat label="Revenue collected" value={formatINR(revenue)} />
        <Stat label="Paid orders" value={paid.length} />
        <Stat label="Unpaid checkouts" value={unpaid.length} hint="Filled the form, didn't pay" />
        <Stat label="Failed payments" value={failed.length} />
        <Stat label="Conversion" value={`${conversion}%`} hint="Paid ÷ checkouts started" />
        <Stat label="Enquiries" value={enquiries.length} />
      </div>

      <nav className="admin-tabs" aria-label="Filter">
        {VIEWS.map((item) => (
          <Link key={item.id} href={`/admin?view=${item.id}`} className={item.id === view ? "active" : ""}>
            {item.label}
          </Link>
        ))}
      </nav>

      {view === "enquiries" ? <EnquiryList enquiries={enquiries} /> : <OrderList orders={shownOrders} />}
    </AdminFrame>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell">
      <SiteHeader note="admin" />
      <section className="admin page-width">{children}</section>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function ContactedToggle({ kind, id, contacted }: { kind: "order" | "enquiry"; id: string; contacted: boolean }) {
  return (
    <form action={toggleContacted}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="contacted" value={String(!contacted)} />
      <button className="pill-button" type="submit">
        {contacted ? "Mark not contacted" : "Mark contacted"}
      </button>
    </form>
  );
}

function OrderList({ orders }: { orders: OrderRecord[] }) {
  if (orders.length === 0) return <p className="admin-empty">Nothing here yet.</p>;

  return (
    <div className="admin-list">
      {orders.map((order) => {
        const { customer } = order;
        const firstName = customer.name.split(" ")[0];
        const latest = order.checkIns.at(-1);
        const answers = latest ? decodeAnswers(latest.answers) : null;
        const scores = answers ? scoreAnswers(answers) : null;
        const concerns = scores?.dimensions.filter((dimension) => dimension.score > 0).sort((a, b) => b.score - a.score) ?? [];
        const message =
          order.status === "paid"
            ? `Namaste ${firstName}, thank you for choosing ${site.brand}! This is the care team — when would be a good time to schedule your first session?`
            : `Namaste ${firstName}, this is the ${site.brand} care team. We saw you were checking out the ${order.items[0]?.name}. Can we help you complete your booking?`;

        return (
          <details key={order.id} className="admin-row">
            <summary>
              <span className={`status-chip ${order.status}`}>{statusLabels[order.status]}</span>
              <span className="admin-name">
                {customer.name}
                <small>
                  {customer.city} · +91 {customer.phone}
                  {order.contacted && " · contacted"}
                </small>
              </span>
              <span>{order.items.map((item) => item.name).join(" + ")}</span>
              <span className="admin-amount">{formatINR(order.total)}</span>
              <span className="admin-date">{dateTime.format(new Date(order.createdAt))}</span>
            </summary>
            <div className="admin-detail">
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div>
                  <dt>Age · gender</dt>
                  <dd>
                    {customer.age} · {optionLabel(GENDER_OPTIONS, customer.gender)}
                  </dd>
                </div>
                <div>
                  <dt>Check-in</dt>
                  <dd>
                    {latest ? `${latest.overallPercent}% care needed` : "—"}
                    {order.checkIns.length > 1 && ` · progress: ${order.checkIns.map((checkIn) => `${checkIn.overallPercent}%`).join(" → ")}`}
                  </dd>
                </div>
                <div>
                  <dt>Areas of concern</dt>
                  <dd>{concerns.length > 0 ? concerns.map((dimension) => `${dimension.label} (${levelLabels[dimension.level]})`).join(", ") : "None flagged"}</dd>
                </div>
                <div>
                  <dt>Said they need</dt>
                  <dd>{scores?.needs.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt>Receipt · order</dt>
                  <dd>
                    {order.receipt} · {order.id}
                  </dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>
                    {order.paymentId ? `${order.paymentId} · ${order.method ?? "—"}` : "—"}
                    {order.failureReason && ` · ${order.failureReason}`}
                  </dd>
                </div>
                {order.couponCode && (
                  <div>
                    <dt>Coupon</dt>
                    <dd>{order.couponCode}</dd>
                  </div>
                )}
                {order.source && (
                  <div>
                    <dt>Source</dt>
                    <dd>{order.source}</dd>
                  </div>
                )}
              </dl>
              <div className="admin-actions">
                <a className="button button-dark" href={`tel:+91${customer.phone}`}>
                  Call
                </a>
                <a className="button button-outline" href={whatsappLink(message, `91${customer.phone}`)} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                <a className="button button-outline" href={`mailto:${customer.email}`}>
                  Email
                </a>
                <ContactedToggle kind="order" id={order.id} contacted={order.contacted} />
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function EnquiryList({ enquiries }: { enquiries: EnquiryRecord[] }) {
  if (enquiries.length === 0) return <p className="admin-empty">No enquiries yet.</p>;

  return (
    <div className="admin-list">
      {enquiries.map((enquiry) => (
        <details key={enquiry.id} className="admin-row">
          <summary>
            <span className={`status-chip ${enquiry.contacted ? "paid" : "created"}`}>{enquiry.contacted ? "Contacted" : "New"}</span>
            <span className="admin-name">
              {enquiry.name}
              <small>
                {enquiry.city} · +91 {enquiry.phone}
              </small>
            </span>
            <span>{ENQUIRY_TYPES[enquiry.type].title}</span>
            <span className="admin-amount">{enquiry.organisation || "—"}</span>
            <span className="admin-date">{dateTime.format(new Date(enquiry.createdAt))}</span>
          </summary>
          <div className="admin-detail">
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{enquiry.email || "—"}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>{enquiry.reference || "—"}</dd>
              </div>
              <div>
                <dt>Check-in band</dt>
                <dd>{enquiry.band ?? "Not taken"}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{enquiry.message || "—"}</dd>
              </div>
            </dl>
            <div className="admin-actions">
              <a className="button button-dark" href={`tel:+91${enquiry.phone}`}>
                Call
              </a>
              <a
                className="button button-outline"
                href={whatsappLink(`Namaste ${enquiry.name.split(" ")[0]}, this is the ${site.brand} team about your ${ENQUIRY_TYPES[enquiry.type].title} request.`, `91${enquiry.phone}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <ContactedToggle kind="enquiry" id={enquiry.id} contacted={enquiry.contacted} />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
