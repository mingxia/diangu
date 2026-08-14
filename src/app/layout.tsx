import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: { default: "用典如神", template: "%s｜用典如神" },
  description: "想表达什么？找一个最恰当的典故。",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>
    <div className="page-pattern" aria-hidden="true" />
    <header>
      <Link className="brand" href="/"><span className="brand-mark">典</span><span><b>用典如神</b><small>DIAN GU RU SHEN</small></span></Link>
      <nav><Link href="/search">寻典</Link><i /> <Link href="/admin">内容后台</Link></nav>
    </header>
    <main>{children}</main>
    <footer><span className="footer-mark">典</span><div><b>用典如神</b><small>从想表达什么，到该用什么典故</small></div><em>观古 · 知今 · 明理</em></footer>
  </body></html>;
}
