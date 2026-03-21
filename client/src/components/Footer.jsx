import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06]"
      style={{ background: "#080612", fontFamily: "'Syne', sans-serif" }}>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        <div className="flex flex-col lg:flex-row lg:justify-between gap-16">

          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Kode<span className="text-violet-500">X</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Engineering the next generation of technical interview preparation.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-col sm:flex-row gap-16">

            {[
              {
                heading: "PLATFORM",
                links: [
                  { label: "Problems",  to: "/problems",  internal: true  },
                  { label: "Contests",  to: "/contests",  internal: true  },
                  { label: "Discuss",   to: "/discuss",   internal: true  },
                ],
              },
              {
                heading: "COMMUNITY",
                links: [
                  { label: "GitHub",  to: "#", internal: false },
                  { label: "Discord", to: "#", internal: false },
                  { label: "Twitter", to: "#", internal: false },
                ],
              },
              {
                heading: "LEGAL",
                links: [
                  { label: "Privacy", to: "/privacy", internal: true },
                  { label: "Terms",   to: "/terms",   internal: true },
                ],
              },
            ].map(col => (
              <div key={col.heading} className="min-w-[130px]">
                <h4 className="text-[10px] font-bold text-gray-600 mb-5 tracking-[0.14em]">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      {link.internal ? (
                        <Link to={link.to}
                          className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.to} target="_blank" rel="noreferrer"
                          className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] mt-16 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-700 text-center sm:text-left">
            © {new Date().getFullYear()} KodeX Platform. Engineered for excellence.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-gray-700">
              System Status:
            </span>
            <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
              All Systems Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer