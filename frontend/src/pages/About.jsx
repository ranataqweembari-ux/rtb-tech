export default function About() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-8 py-10">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-[20px] mb-5"
          style={{ background: "var(--accent)", color: "#181b22" }}
        >
          R
        </div>
        <h1 className="text-[22px] font-semibold mb-1">About RTB&apos;s Tech</h1>
        <p className="text-text-secondary text-[14px] mb-6">Python Learning IDE</p>

        <p className="text-[14px] leading-relaxed text-text-secondary mb-4">
          RTB&apos;s Tech is a Python-focused learning and development environment created by Rana Taqweem Bari.
        </p>
        <p className="text-[14px] leading-relaxed text-text-secondary mb-8">
          It is designed to help students and beginners learn Python fundamentals and Object-Oriented Programming
          through hands-on coding.
        </p>

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-2">Developer</h2>
        <p className="text-[14px] mb-1">Rana Taqweem Bari</p>
        <p className="text-[13px] text-text-secondary mb-8">Software Engineering Student &amp; Backend Developer</p>

        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-2">Technology</h2>
        <ul className="text-[14px] text-text-secondary space-y-1">
          <li>Python &amp; FastAPI</li>
          <li>React &amp; Vite</li>
          <li>SQLite &amp; SQLAlchemy</li>
          <li>Monaco Editor</li>
        </ul>
      </div>
    </div>
  );
}
