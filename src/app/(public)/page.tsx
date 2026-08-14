import Link from "next/link";
import { getFeaturedAllusions } from "@/services/allusion.service";
import { listScenarios } from "@/services/taxonomy.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [items, scenes] = await Promise.all([
    getFeaturedAllusions(),
    listScenarios(),
  ]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><i />中文典故知识库 · 用典工具<i /></span>
          <h1><span>用典</span>如神</h1>
          <p>想表达什么？找一个最恰当的典故。</p>
          <form className="searchbox" action="/search">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input name="q" aria-label="搜索典故" placeholder="例如：怀才不遇、久别重逢、失败后重新开始……" />
            <button>寻找典故 <span aria-hidden="true">→</span></button>
          </form>
        </div>
        <div className="hero-seal" aria-hidden="true"><b>典</b><span>观古鉴今</span></div>
      </section>

      <section className="section scenes">
        <div className="section-title"><span>壹</span><div><small>随境择言</small><h2>按场景找典故</h2></div></div>
        <div className="chips">{scenes.map((x) =>
          <Link className="chip" href={`/search?q=${encodeURIComponent(x.name)}`} key={x.id}>{x.name}</Link>
        )}</div>
      </section>

      <section className="section featured">
        <div className="section-title"><span>贰</span><div><small>古意新读</small><h2>精选典故</h2></div></div>
        <div className="grid">{items.slice(0, 6).map((x, index) =>
          <Link className="card" href={`/dian-gu/${x.slug}`} key={x.id}>
            <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{x.title}</h3>
            <div className="muted">{x.summary}</div>
            <span className="read-more">阅典 <i>→</i></span>
          </Link>
        )}</div>
      </section>

      {items[0] && <section className="wander">
        <div><small>不期而遇，亦是雅趣</small><h2>偶拾一典，品古人智慧</h2></div>
        <Link className="wander-link" href={`/dian-gu/${items[Math.floor(Math.random() * items.length)].slug}`}>随便看看 <span>→</span></Link>
      </section>}
    </>
  );
}
