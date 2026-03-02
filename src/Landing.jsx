import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Minimal inline styles for Landing page (standalone, no index.css dependency overlap) ───
const PURPLE = '#8b5cf6';
const DARK_BG = '#0a0a0b';
const CARD_BG = '#121214';
const BORDER = 'rgba(255,255,255,0.08)';

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
    const [ref, vis] = useInView();
    return (
        <div ref={ref} style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(32px)',
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            ...style
        }}>
            {children}
        </div>
    );
}

const FEATURES = [
    {
        emoji: '📊',
        title: 'Akıllı Harcama Takibi',
        desc: 'Gelir ve giderlerinizi kategorilere göre takip edin. AI destekli otomatik kategori tespiti, makbuz fotoğraflama ve ortak harcama bölüşümü ile tam kontrol sizde.',
        tags: ['Otomatik Kategori', 'Makbuz Tarama', 'Ortak Harcama'],
    },
    {
        emoji: '🎯',
        title: 'Birikim Hedefleri',
        desc: 'Tatil, araba, ev… Hayalleriniz için hedefe özel kumbara oluşturun. Tek tıkla para ekleyin, ilerlemenizi görsel olarak takip edin.',
        tags: ['Görsel İlerleme', 'Kumbara Sistemi', 'Para Ekle'],
    },
    {
        emoji: '📅',
        title: 'Abonelik Yönetimi',
        desc: 'Netflix, Spotify, ChatGPT… Tüm aboneliklerinizi tek yerden yönetin. Otomatik yenileme tarihleri ve kategori bazlı takip.',
        tags: ['Dizi/Film', 'Müzik', 'Yapay Zeka', 'Oyun'],
    },
    {
        emoji: '🤝',
        title: 'Borç Defteri',
        desc: 'Kime borçlusunuz, kimden alacaklısınız? Arkadaş borçlarını, kredi ödemelerini takip edin. Kapatıldığında otomatik bakiyeye yansır.',
        tags: ['Alacak/Borç', 'Hatırlatma', 'Otomatik Yansıma'],
    },
    {
        emoji: '🗓️',
        title: 'Finansal Takvim',
        desc: 'Harcamalarınızı, abonelik yenileme tarihlerini ve borç vadelerini takvim üzerinde görün. Gün bazlı detaylı görünüm.',
        tags: ['Aylık Görünüm', 'Etkinlik Listesi', 'Vade Takibi'],
    },
    {
        emoji: '💼',
        title: 'Varlık Yönetimi',
        desc: 'Banka hesapları, nakit, kripto, altın ve gayrimenkul varlıklarınızı tek bir portföyde takip edin. Net servetinizi anlık görün.',
        tags: ['Portföy', 'Net Servet', 'Kripto', 'Altın'],
    },
    {
        emoji: '📈',
        title: 'Akıllı İstatistikler',
        desc: 'Kategori dağılımı, dönemsel karşılaştırma ve AI finansal içgörüleri. Paranızı nereye harcadığınızı bir bakışta anlayın.',
        tags: ['Donut Grafik', 'AI İçgörü', 'Dönem Karşılaştırma'],
    },
    {
        emoji: '💾',
        title: 'Güvenli Yedekleme',
        desc: 'Tüm verilerinizi tek tıkla JSON dosyası olarak indirin. Cihaz değişse bile verileriniz güvende. 24 saat hatırlatma sistemi.',
        tags: ['JSON Yedek', 'Geri Yükleme', 'Offline Çalışma'],
    },
];

const STATS = [
    { value: '8+', label: 'Sekme ve Özellik' },
    { value: '100%', label: 'Ücretsiz & Açık Kaynak' },
    { value: '0', label: 'Kayıt & Abonelik' },
    { value: '∞', label: 'İşlem Kaydı' },
];

export default function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div style={{ background: DARK_BG, color: '#f8f9fa', fontFamily: "'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── NAVBAR ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: scrolled ? 'rgba(10,10,11,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 40px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>💼</span>
                    <span style={{ fontWeight: '700', fontSize: '1.3rem', background: `linear-gradient(135deg, ${PURPLE}, #6366f1)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NexSpend</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <a href="#features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                        Özellikler
                    </a>
                    <a href="#stats" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                        Neden NexSpend?
                    </a>
                    <button
                        onClick={() => navigate('/app')}
                        style={{
                            background: `linear-gradient(135deg, ${PURPLE}, #6366f1)`,
                            color: '#fff', border: 'none', borderRadius: '8px',
                            padding: '8px 20px', fontWeight: '600', cursor: 'pointer',
                            fontSize: '0.9rem', transition: 'opacity 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'scale(1)'; }}
                    >
                        Uygulamayı Aç
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
                {/* Background glow */}
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: `radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)`, pointerEvents: 'none' }} />

                <FadeIn>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.85rem', color: PURPLE, marginBottom: '24px' }}>
                        ✨ Ücretsiz · Kayıt Yok · Veriler Sizde
                    </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                        Finansal özgürlüğünüz<br />
                        <span style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #6366f1 50%, #22d3ee 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            tek bir uygulamada.
                        </span>
                    </h1>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.6)', maxWidth: '580px', lineHeight: 1.7, marginBottom: '40px' }}>
                        Harcamalarınızı takip edin, birikim hedefleri belirleyin, borçlarınızı yönetin. Kayıt olmadan, ücretsiz, verileriniz tamamen sizde.
                    </p>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/app')}
                            style={{
                                background: `linear-gradient(135deg, ${PURPLE}, #6366f1)`,
                                color: '#fff', border: 'none', borderRadius: '12px',
                                padding: '16px 32px', fontWeight: '700', cursor: 'pointer',
                                fontSize: '1.05rem', boxShadow: `0 8px 32px rgba(139,92,246,0.35)`,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 16px 40px rgba(139,92,246,0.45)`; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 8px 32px rgba(139,92,246,0.35)`; }}
                        >
                            Ücretsiz Başla
                        </button>
                        <a href="#features" style={{
                            background: 'transparent', color: '#fff', border: `1px solid ${BORDER}`,
                            borderRadius: '12px', padding: '16px 32px', fontWeight: '600',
                            fontSize: '1.05rem', cursor: 'pointer', textDecoration: 'none',
                            transition: 'border-color 0.2s, background 0.2s',
                            display: 'inline-block',
                        }}
                            onMouseEnter={e => { e.target.style.borderColor = PURPLE; e.target.style.background = 'rgba(139,92,246,0.08)'; }}
                            onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.background = 'transparent'; }}
                        >
                            Özellikleri Gör
                        </a>
                    </div>
                </FadeIn>

                {/* Dashboard mockup */}
                <FadeIn delay={0.4} style={{ marginTop: '72px', width: '100%', maxWidth: '900px' }}>
                    <div style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${BORDER}`,
                        background: CARD_BG,
                        position: 'relative',
                    }}>
                        {/* Fake browser bar */}
                        <div style={{ background: '#1c1c1f', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${BORDER}` }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                            <div style={{ flex: 1, background: '#0a0a0b', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', margin: '0 auto' }}>nexspend.vercel.app/app</div>
                        </div>

                        {/* App screenshot simulation */}
                        <div style={{ display: 'flex', minHeight: '420px' }}>
                            {/* Sidebar */}
                            <div style={{ width: '220px', background: 'rgba(28,28,31,0.9)', borderRight: `1px solid ${BORDER}`, padding: '24px 16px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>💼</span>
                                    <span style={{ fontWeight: '700', background: `linear-gradient(135deg, ${PURPLE}, #6366f1)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NexSpend</span>
                                </div>
                                {['🏠 Ana Sayfa', '📊 İstatistikler', '🎯 Hedefler', '📅 Takvim', '🤝 Borç Defteri', '🔄 Abonelikler', '💼 Varlıklarım', '⚙️ Ayarlar'].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                                        background: i === 0 ? `rgba(139,92,246,0.15)` : 'transparent',
                                        color: i === 0 ? PURPLE : 'rgba(255,255,255,0.6)',
                                        fontSize: '0.85rem', fontWeight: i === 0 ? '600' : '400',
                                    }}>{item}</div>
                                ))}
                            </div>

                            {/* Main area */}
                            <div style={{ flex: 1, padding: '24px', background: DARK_BG }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Merhaba, Kullanıcı 👋</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>İşte finansal özetiniz</div>
                                </div>

                                {/* Stat cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                    {[
                                        { label: 'Toplam Bakiye', value: '₺24.850', color: PURPLE, emoji: '💰' },
                                        { label: 'Bu Ay Gelir', value: '₺18.500', color: '#10b981', emoji: '📈' },
                                        { label: 'Bu Ay Gider', value: '₺6.320', color: '#ef4444', emoji: '📉' },
                                    ].map((c, i) => (
                                        <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{c.label}</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: c.color }}>{c.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent transactions */}
                                <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px' }}>Son İşlemler</div>
                                    {[
                                        { title: 'Migros Alışveriş', cat: '🛍️', amount: '-₺380', color: '#ef4444' },
                                        { title: 'Maaş', cat: '💰', amount: '+₺18.500', color: '#10b981' },
                                        { title: 'Netflix', cat: '📺', amount: '-₺65', color: '#ef4444' },
                                    ].map((tx, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{tx.cat}</span>
                                                <span style={{ fontSize: '0.8rem' }}>{tx.title}</span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: tx.color }}>{tx.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* ── STATS ── */}
            <section id="stats" style={{ padding: '80px 24px', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
                    {STATS.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div>
                                <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', background: `linear-gradient(135deg, ${PURPLE}, #22d3ee)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>{s.label}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ── FEATURES GRID ── */}
            <section id="features" style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
                <FadeIn style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <div style={{ display: 'inline-block', color: PURPLE, fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Özellikler</div>
                    <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px' }}>Paranızı her açıdan yönetin</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>Tek bir uygulama, tüm finansal yaşamınız.</p>
                </FadeIn>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {FEATURES.map((f, i) => (
                        <FadeIn key={i} delay={(i % 3) * 0.1}>
                            <div
                                style={{
                                    background: CARD_BG,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: '16px',
                                    padding: '28px',
                                    height: '100%',
                                    transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{f.emoji}</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '16px' }}>{f.desc}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {f.tags.map((tag, j) => (
                                        <span key={j} style={{ fontSize: '0.72rem', background: 'rgba(139,92,246,0.1)', color: PURPLE, border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '3px 10px', fontWeight: '500' }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: '100px 24px', background: 'rgba(28,28,31,0.4)', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <FadeIn style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <div style={{ display: 'inline-block', color: PURPLE, fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Nasıl Çalışır?</div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '800', letterSpacing: '-0.02em' }}>3 adımda başla</h2>
                    </FadeIn>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
                        {[
                            { step: '01', title: 'Uygulamayı Aç', desc: 'Kayıt, şifre, e-posta yok. Sadece bağlantıya tıkla ve hemen kullanmaya başla.', emoji: '🚀' },
                            { step: '02', title: 'İşlem Ekle', desc: 'Harcamalarını ve gelirlerini gir. AI otomatik kategori önerir, makbuz ekleyebilirsin.', emoji: '📝' },
                            { step: '03', title: 'Kontrol Al', desc: 'Grafikler, hedefler ve AI içgörüleri ile paranızın nereye gittiğini anlık görün.', emoji: '💡' },
                        ].map((s, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `rgba(139,92,246,0.1)`, border: `2px solid rgba(139,92,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>{s.emoji}</div>
                                    <div style={{ fontSize: '0.75rem', color: PURPLE, fontWeight: '700', letterSpacing: '0.1em', marginBottom: '8px' }}>ADIM {s.step}</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px' }}>{s.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{s.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRIVACY / NO SIGNUP ── */}
            <section style={{ padding: '100px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <FadeIn>
                    <div style={{ background: CARD_BG, border: `1px solid rgba(139,92,246,0.3)`, borderRadius: '24px', padding: '56px 40px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Gizlilik birinci öncelik</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
                            Tüm verileriniz <strong style={{ color: '#fff' }}>yalnızca tarayıcınızda</strong> saklanır. Sunucuya gönderilmez. Hesap oluşturmanıza gerek yok. Verilerinizi istediğiniz zaman JSON dosyası olarak indirip yedekleyebilirsiniz.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
                            {['✅ Sunucu Yok', '✅ Kayıt Yok', '✅ Reklam Yok', '✅ Tamamen Ücretsiz'].map((t, i) => (
                                <span key={i} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: '80px 24px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: `radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <FadeIn>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                        Finansal kontrolü<br />
                        <span style={{ background: `linear-gradient(135deg, ${PURPLE}, #22d3ee)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>bugün ele al.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', marginBottom: '40px' }}>Ücretsiz. Kayıt yok. Hemen başla.</p>
                    <button
                        onClick={() => navigate('/app')}
                        style={{
                            background: `linear-gradient(135deg, ${PURPLE}, #6366f1)`,
                            color: '#fff', border: 'none', borderRadius: '14px',
                            padding: '18px 48px', fontWeight: '700', cursor: 'pointer',
                            fontSize: '1.1rem', boxShadow: `0 8px 40px rgba(139,92,246,0.4)`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-3px) scale(1.02)'; e.target.style.boxShadow = `0 16px 50px rgba(139,92,246,0.5)`; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = `0 8px 40px rgba(139,92,246,0.4)`; }}
                    >
                        Uygulamayı Aç
                    </button>
                </FadeIn>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ padding: '32px 40px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>💼</span>
                    <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>NexSpend</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                    © 2026 NexSpend · Kişisel Finans Uygulaması
                </div>
                <button onClick={() => navigate('/app')} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Uygulamayı Aç
                </button>
            </footer>
        </div>
    );
}
