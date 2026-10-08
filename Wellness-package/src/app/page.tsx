import { QuizFunnel } from "@/components/QuizFunnel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="app-shell">
      <SiteHeader />
      <QuizFunnel />
      <SiteFooter />
    </main>
  );
}
