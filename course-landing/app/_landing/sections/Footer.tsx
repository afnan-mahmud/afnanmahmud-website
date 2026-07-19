import { Container } from '../ui';

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-white py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--ink-muted)] sm:flex-row">
        <p className="font-black text-[var(--ink)]">
          Afnan<span className="accent-text">.</span>
        </p>
        <p>© {new Date().getFullYear()} Afnan Mahmud. সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex gap-4">
          <a href="https://afnanmahmud.com/privacy" className="hover:text-[var(--ink)]">প্রাইভেসি</a>
          <a href="https://afnanmahmud.com/terms" className="hover:text-[var(--ink)]">শর্তাবলী</a>
          <a href="https://afnanmahmud.com/refund" className="hover:text-[var(--ink)]">রিফান্ড</a>
        </div>
      </Container>
    </footer>
  );
}
