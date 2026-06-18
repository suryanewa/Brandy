import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { pageSections } from "./registry";

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {pageSections.map(({ label, Component }) => (
          <Component key={label} />
        ))}
      </main>
      <Footer />
    </>
  );
}
