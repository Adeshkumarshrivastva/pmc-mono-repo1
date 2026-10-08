import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { submitEnquiry } from "./actions";

export default async function EnquirePage(props: { searchParams: Promise<{ sent?: string }> }) {
  const params = await props.searchParams;

  return (
    <main className="app-shell">
      <SiteHeader note="enquiries" />
      <section className="admin page-width">
        <p className="eyebrow">Positive Mind Care</p>
        <h1 className="admin-title">CGHS / CSR enquiries</h1>
        {params.sent === "1" && <p className="form-alert">Thanks — our team will reach out shortly.</p>}
        <form action={submitEnquiry} className="checkout-form" style={{ maxWidth: 420 }}>
          <div className="field">
            <label htmlFor="e-type">Enquiry type</label>
            <select id="e-type" name="type" defaultValue="cghs">
              <option value="cghs">CGHS empanelment</option>
              <option value="csr">CSR / corporate wellness</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-name">Name</label>
            <input id="e-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="e-phone">Phone</label>
            <input id="e-phone" name="phone" required />
          </div>
          <div className="field">
            <label htmlFor="e-email">Email</label>
            <input id="e-email" name="email" type="email" />
          </div>
          <div className="field">
            <label htmlFor="e-city">City</label>
            <input id="e-city" name="city" required />
          </div>
          <div className="field">
            <label htmlFor="e-org">Organisation</label>
            <input id="e-org" name="organisation" />
          </div>
          <div className="field">
            <label htmlFor="e-message">Message</label>
            <input id="e-message" name="message" />
          </div>
          <button className="button button-dark full" type="submit">
            Submit enquiry
          </button>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
