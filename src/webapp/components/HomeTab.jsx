import React from 'react';
import { Section, Cell, Banner, Button, Badge } from '@telegram-apps/telegram-ui';
import { ChevronRight, Sparkles, BookOpen, Search, Bookmark, HelpCircle } from 'lucide-react';

export function HomeTab({ stats, announcements, onSelectLevel, onSelectPillar, onNavigateTab }) {
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  return (
    <div style={{ paddingBottom: '16px' }}>
      {/* Hero Card with GASS Core Metrics */}
      <div className="hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge mode="primary" style={{ background: '#E00613', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
            KNUST STATISTICS
          </Badge>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>Digital Academic Hub</span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>Welcome, Scholar 🎓</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>
          Access verified lecture slides, past questions, statistical software, and academic support.
        </p>

        {/* Real Dynamic Stats Grid */}
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <div className="hero-stat-num">{stats?.totalUsers || 240}</div>
            <div className="hero-stat-label">Students</div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-num">{stats?.totalResources || 58}</div>
            <div className="hero-stat-label">Resources</div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-num">{stats?.pendingRequests !== undefined ? stats.pendingRequests : 3}</div>
            <div className="hero-stat-label">Pending Req</div>
          </div>
        </div>
      </div>

      {/* Featured Departmental Announcement Banner */}
      {latestAnnouncement && (
        <div style={{ padding: '0 16px', marginBottom: '12px' }}>
          <Banner
            type="section"
            callout="ANNOUNCEMENT"
            header={latestAnnouncement.title}
            description={latestAnnouncement.content}
            before={<Sparkles size={24} color="#0B536F" />}
          />
        </div>
      )}

      {/* Quick Access Search */}
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => onNavigateTab('search')}
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#64748B',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer'
          }}
        >
          <Search size={18} color="#0B536F" />
          <span>Search courses, codes, past questions...</span>
        </button>
      </div>

      {/* Academic Curriculum Section */}
      <Section header="Academic Curriculum">
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-3d-icon" alt="L100" />}
          subtitle="Foundations: Calculus, Algebra, Descriptive Statistics"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(100)}
        >
          Level 100
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-3d-icon" alt="L200" />}
          subtitle="Intermediate: Probability Theory, Statistical Methods"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(200)}
        >
          Level 200
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-3d-icon" alt="L300" />}
          subtitle="Advanced: Inference, Regression, Stochastic Processes"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(300)}
        >
          Level 300
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-3d-icon" alt="L400" />}
          subtitle="Specialization: Multivariate Analysis, Project Thesis"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(400)}
        >
          Level 400
        </Cell>
      </Section>

      {/* Beyond Curriculum Competencies Section */}
      <Section header="Beyond Curriculum — Practical Skills" style={{ marginTop: '16px' }}>
        <Cell
          before={<img src="/img/track-ds.png" className="cell-3d-icon" alt="AI & ML" />}
          subhead="MACHINE LEARNING & DATA"
          subtitle="Supervised learning, deep learning, PyTorch, predictive analytics"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('ds_ml')}
        >
          AI & ML
        </Cell>
        <Cell
          before={<img src="/img/track-code.png" className="cell-3d-icon" alt="Software" />}
          subhead="COMPUTATIONAL TOOLS"
          subtitle="R Studio, Python, SQL databases, LaTeX academic writing"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('prog_tools')}
        >
          SOFTWARE
        </Cell>
        <Cell
          before={<img src="/img/track-career.png" className="cell-3d-icon" alt="Careers" />}
          subhead="INDUSTRY & OPPORTUNITIES"
          subtitle="Data analyst internships, CV guides, scholarship portals"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('career_growth')}
        >
          CAREERS
        </Cell>
        <Cell
          before={<img src="/img/track-research.png" className="cell-3d-icon" alt="Research" />}
          subhead="ACADEMIC RIGOR"
          subtitle="Statistical methodology, survey design, biostatistics, actuarial"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('research_thesis')}
        >
          RESEARCH
        </Cell>
      </Section>
    </div>
  );
}
