"use client";
import { useEffect, useMemo, useState } from "react";

const initialProblems = [
  { id: 1, title: "صعوبة الوصول إلى الفرص والورش التقنية", description: "يواجه الطلاب صعوبة في معرفة مواعيد الورش والفعاليات التقنية والفرص المتاحة داخل الجامعة.", category: "الحياة الجامعية", votes: 24, comments: 12, supporters: 32, skills: ["Frontend", "UI/UX", "Backend"] },
  { id: 2, title: "تشتت مصادر المبادرات الطلابية", description: "الحاجة إلى مساحة موحدة تجمع المبادرات والأفكار والفرق الطلابية في مكان واحد.", category: "المبادرات", votes: 18, comments: 7, supporters: 21, skills: ["Product", "Frontend", "Research"] },
  { id: 3, title: "صعوبة تكوين فرق متعددة التخصصات", description: "يبحث أصحاب الأفكار عن طلاب يمتلكون مهارات متنوعة للعمل على حلول مشتركة.", category: "العمل الجماعي", votes: 15, comments: 5, supporters: 19, skills: ["AI/ML", "Backend", "Design"] },
];
const nav = [{ id: "home", icon: "⌂", label: "الرئيسية" }, { id: "problems", icon: "▱", label: "بنك المشكلات" }, { id: "teams", icon: "♧", label: "الفرق" }, { id: "projects", icon: "▣", label: "مشاريعي" }, { id: "events", icon: "▦", label: "الفرص والفعاليات" }, { id: "profile", icon: "◉", label: "ملفي الشخصي" }];
const teams = [{ name: "فريق SmartCampus", desc: "تطبيق لإدارة مرافق الجامعة بذكاء.", skills: ["UI/UX", "Backend", "Frontend"], need: "بحاجة لأعضاء" }, { name: "فريق StudyMate", desc: "منصة ذكية لتنظيم الدراسة والمهام.", skills: ["Data", "AI/ML", "Frontend"], need: "بحاجة لأعضاء" }];

export default function Home() {
  const [active, setActive] = useState("home");
  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("midad-intro-seen") === "1") setShowIntro(false);
    } catch (_) {}
  }, []);
  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => dismissIntro(), 6500);
    return () => window.clearTimeout(timer);
  }, [showIntro]);
  function dismissIntro() {
    if (introLeaving) return;
    setIntroLeaving(true);
    try { sessionStorage.setItem("midad-intro-seen", "1"); } catch (_) {}
    window.setTimeout(() => setShowIntro(false), 700);
  }
  const [problems, setProblems] = useState(initialProblems);
  const [votes, setVotes] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "الحياة الجامعية" });
  const [toast, setToast] = useState("");
  const [tasks, setTasks] = useState([false, true, false]);
  const [joined, setJoined] = useState([]);
  const filtered = useMemo(() => problems.filter(p => `${p.title} ${p.description} ${p.category}`.includes(query)), [problems, query]);
  const pageTitle = nav.find(x => x.id === active)?.label || "الرئيسية";
  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 2400); }
  function vote(id) { if (votes.includes(id)) return notify("سبق وصوّتِ لهذه المشكلة"); setVotes(v => [...v, id]); setProblems(ps => ps.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p)); notify("تم تسجيل تصويتك"); }
  function addProblem(e) { e.preventDefault(); setProblems(ps => [{ ...form, id: Date.now(), votes: 0, comments: 0, supporters: 1, skills: ["Frontend", "Research"] }, ...ps]); setForm({ title: "", description: "", category: "الحياة الجامعية" }); setModal(false); setActive("problems"); notify("تمت إضافة المشكلة بنجاح"); }
  return <>
  {showIntro && <section className={introLeaving ? "intro-screen intro-leaving" : "intro-screen"} dir="rtl" aria-label="مقدمة مِداد">
    <div className="intro-grid" />
    <div className="intro-ambient intro-ambient-one" /><div className="intro-ambient intro-ambient-two" />
    <div className="intro-orbit intro-orbit-one" /><div className="intro-orbit intro-orbit-two" />
    <div className="intro-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
    <div className="intro-content">
      <div className="intro-emblem"><span className="intro-m">M</span><i className="intro-pen" /><b className="intro-spark">✦</b></div>
      <div className="intro-wordmark">مِداد</div>
      <div className="intro-english">M I D A D</div>
      <div className="intro-rule"><span /></div>
      <p className="intro-tagline">من الفكرة .. إلى التأثير</p>
      <p className="intro-subtitle">مساحة تجمع العقول وتحول التحديات إلى حلول مبتكرة</p>
      <div className="intro-features"><span>كوّن فريقك</span><i /><span>اعمل على مشروعك</span><i /><span>حلّ التحديات</span></div>
      <div className="intro-loading"><span /></div>
    </div>
    <button className="intro-skip" onClick={dismissIntro}>تخطي <span>←</span></button>
    <div className="intro-footer">مساحة الابتكار الجامعي</div>
  </section>}
  <main className="shell" dir="rtl">
    <aside className="sidebar">
      <div className="brand"><div className="brand-symbol"><span>M</span><i /></div><div className="brand-name"><strong>مِداد</strong><small>M I D A D</small></div></div>
      <div className="side-caption">مساحة الابتكار الجامعي</div>
      <nav>{nav.map(item => <button key={item.id} onClick={() => setActive(item.id)} className={active === item.id ? "nav active" : "nav"}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="idea-card"><div className="idea-bulb">♧</div><strong>لديك فكرة؟</strong><p>أضف مشكلة أو مقترحًا جديدًا وساهم في صناعة الحل.</p><button onClick={() => setModal(true)}>＋ إضافة مشكلة</button></div>
      <div className="side-user"><div className="avatar">ر</div><div><b>رهف الخماش</b><small>طالبة · علوم حاسب</small></div><span className="dots">•••</span></div>
    </aside>
    <section className="main">
      <header className="topbar"><div className="user-head"><div className="avatar small">ر</div><div><b>رهف الخماش</b><small>طالبة · علوم حاسب</small></div><span className="top-divider"/><button className="top-icon" aria-label="الإشعارات">♧</button><button className="top-icon" aria-label="الرسائل">▢</button></div><label className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن مشكلة، مشروع، أو مهارة..."/><kbd>⌘K</kbd></label></header>
      <div className="content">
        {active === "home" && <>
          <section className="hero"><div className="hero-art"><div className="campus-glow"/><div className="hero-monogram">M</div><div className="hero-orbit"/></div><div className="hero-copy"><span className="pill">✦ منصة مِداد الجامعية</span><h1>من الفكرة إلى <em>التأثير.</em></h1><p>منصة تجمع طلاب الجامعات لتحويل التحديات الجامعية إلى مشاريع وحلول تقنية مبتكرة.</p><div className="hero-actions"><button className="primary" onClick={() => setModal(true)}>ابدأ الآن <span>←</span></button><button className="outline" onClick={() => setActive("problems")}>اكتشف المشكلات <span>◉</span></button></div></div></section>
          <section className="stats"><Stat icon="♙" value="2,480" label="طالبًا مشاركًا" tone="blue"/><Stat icon="⚑" value={String(320 + problems.length - 3)} label="مشكلة مسجلة" tone="purple"/><Stat icon="▱" value="126" label="مشروع قيد التنفيذ" tone="blue"/><Stat icon="♧" value="48" label="فريق نشط" tone="purple"/></section>
          <div className="dashboard-grid"><section className="panel problem-panel"><div className="panel-title"><div><h2>مشكلات مقترحة لك</h2><p>تحديات جامعية تنتظر أفكارك وحلولك</p></div><button className="link" onClick={() => setActive("problems")}>عرض الكل ←</button></div><div className="featured-problem"><div className="problem-thumb"><div className="thumb-calendar">▦</div><small>OPPORTUNITY</small></div><div className="featured-copy"><span className="pill subtle">♧ الحياة الجامعية</span><h3>{filtered[0]?.title || "لا توجد نتائج مطابقة"}</h3><p>{filtered[0]?.description || "جرّبي البحث بكلمات أخرى."}</p><div className="problem-bottom"><span>♧ {filtered[0]?.supporters ?? 0} طالبًا مهتمًا</span><span>♡ {filtered[0]?.votes ?? 0}</span><span>▢ {filtered[0]?.comments ?? 0}</span><button onClick={() => filtered[0] && vote(filtered[0].id)} className={filtered[0] && votes.includes(filtered[0].id) ? "voted" : "vote"}>{filtered[0] && votes.includes(filtered[0].id) ? "تم التصويت" : "صوّت للمشكلة"}</button></div></div></div></section>
          <section className="panel teams-panel"><div className="panel-title"><div><h2>فرق تبحث عن أعضاء</h2><p>انضم إلى فريق يشاركك الشغف</p></div><button className="link" onClick={() => setActive("teams")}>عرض الكل ←</button></div>{teams.map((team, i) => <div className="team-row" key={team.name}><div className="team-icon">♧</div><div className="team-copy"><b>{team.name}</b><p>{team.desc}</p><div className="tags">{team.skills.map(s => <span key={s}>{s}</span>)}</div></div><button className="join" onClick={() => { setJoined(j => [...j, team.name]); notify(`تم إرسال طلب الانضمام إلى ${team.name}`); }}>{joined.includes(team.name) ? "تم الطلب" : "انضم"}</button></div>)}</section></div>
        </>}
        {active === "problems" && <><PageHeading title="بنك المشكلات" subtitle="اكتشف التحديات الجامعية وصوّت للأفكار التي تستحق التنفيذ." action={() => setModal(true)}/><div className="problem-list">{filtered.map(p => <article className="list-problem" key={p.id}><span className="pill subtle">{p.category}</span><h3>{p.title}</h3><p>{p.description}</p><div className="tags">{p.skills.map(s => <span key={s}>{s}</span>)}</div><div className="problem-bottom"><span>♧ {p.supporters} مهتم</span><span>♡ {p.votes} تصويت</span><button className={votes.includes(p.id) ? "voted" : "vote"} onClick={() => vote(p.id)}>{votes.includes(p.id) ? "تم التصويت" : "صوّت"}</button></div></article>)}</div></>}
        {active === "teams" && <><PageHeading title="الفرق الطلابية" subtitle="كوّن فريقًا يجمع مهارات مختلفة لتحويل الأفكار إلى واقع."/><div className="cards">{teams.map(t => <article className="team-card" key={t.name}><div className="team-icon large">♧</div><h3>{t.name}</h3><p>{t.desc}</p><div className="tags">{t.skills.map(s => <span key={s}>{s}</span>)}</div><button className="primary" onClick={() => notify("تم إرسال طلب الانضمام")}>طلب انضمام</button></article>)}</div></>}
        {active === "projects" && <><PageHeading title="مشاريعي" subtitle="تابع تقدم المشاريع التي تعمل عليها."/><div className="empty"><div>▣</div><h3>مساحتك جاهزة لمشروعك القادم</h3><p>انضم إلى فريق أو ابدأ من مشكلة منشورة لتحويل فكرتك إلى مشروع.</p><button className="primary" onClick={() => setActive("problems")}>اكتشف المشكلات</button></div></>}
        {active === "events" && <><PageHeading title="الفرص والفعاليات" subtitle="تابع الورش والهاكاثونات والفرص التقنية القادمة."/><div className="cards"><article className="team-card"><div className="event-date">٢٨ نوفمبر</div><h3>ورشة بناء المنتجات الرقمية</h3><p>تعرّف على مراحل تحويل الفكرة إلى منتج قابل للتجربة.</p><button className="outline">عرض التفاصيل</button></article><article className="team-card"><div className="event-date">٥ ديسمبر</div><h3>هاكاثون الحلول الجامعية</h3><p>كوّن فريقك وشارك في تطوير حلول لتحديات الحرم الجامعي.</p><button className="outline">عرض التفاصيل</button></article></div></>}
        {active === "profile" && <><PageHeading title="ملفي الشخصي" subtitle="مساحتك لعرض مهاراتك واهتماماتك."/><div className="profile"><div className="profile-cover"/><div className="profile-body"><div className="avatar profile-avatar">ر</div><h2>رهف الخماش</h2><p>طالبة علوم حاسب · مهتمة بالتقنية والابتكار</p><div className="tags"><span>Frontend</span><span>Java</span><span>Problem Solving</span></div></div></div></>}
      </div>
    </section>
    {modal && <div className="overlay" onClick={() => setModal(false)}><form className="modal" onSubmit={addProblem} onClick={e => e.stopPropagation()}><button type="button" className="close" onClick={() => setModal(false)}>×</button><span className="eyebrow">شاركنا التحدي</span><h2>إضافة مشكلة جديدة</h2><p>اكتب المشكلة بوضوح حتى يتمكن الطلاب من فهمها والمساهمة في حلها.</p><label>عنوان المشكلة<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ما المشكلة التي تواجهها؟"/></label><label>التصنيف<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>الحياة الجامعية</option><option>التقنية</option><option>التعليم</option><option>المبادرات</option></select></label><label>وصف المشكلة<textarea required rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="اشرح المشكلة وتأثيرها..."/></label><button className="primary full">نشر المشكلة</button></form></div>}
    {toast && <div className="toast">{toast}</div>}
  </main>
  </>;
}
function Stat({icon,value,label,tone}) { return <article className="stat"><div className={`stat-icon ${tone}`}>{icon}</div><div><strong>{value}</strong><small>{label}</small></div></article>; }
function PageHeading({title,subtitle,action}) { return <div className="page-heading"><div><span className="eyebrow">MIDAD / EXPLORE</span><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="primary" onClick={action}>＋ إضافة مشكلة</button>}</div>; }
