import React from 'react';
import { Section, Cell, Banner, InlineButtons } from '@telegram-apps/telegram-ui';
import { ChevronRight, Sparkles, Users, FileText, Clock } from 'lucide-react';

export function HomeTab({ stats, announcements, onSelectLevel, onSelectPillar }) {
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 0 24px' }}>
      {/* Official Telegram UI Hero Banner */}
      <div style={{ padding: '0 16px' }}>
        <Banner
          type="section"
          callout="KNUST STATISTICS • ACADEMIC HUB"
          header="Welcome, Scholar 🎓"
          description="Verified course syllabi, lecture slides, past exam questions, and practical software guides."
        />
      </div>

      {/* Official Telegram UI Inline Action / Metric Buttons */}
      <div style={{ padding: '0 16px' }}>
        <InlineButtons mode="bezeled">
          <InlineButtons.Item text={`${stats?.totalUsers || 240} Students`}>
            <Users size={20} color="#0B536F" />
          </InlineButtons.Item>
          <InlineButtons.Item text={`${stats?.totalResources || 58} Materials`}>
            <FileText size={20} color="#0B536F" />
          </InlineButtons.Item>
          <InlineButtons.Item text={`${stats?.pendingRequests !== undefined ? stats.pendingRequests : 3} Requests`}>
            <Clock size={20} color="#0B536F" />
          </InlineButtons.Item>
        </InlineButtons>
      </div>

      {/* Departmental Announcement Banner */}
      {latestAnnouncement && (
        <div style={{ padding: '0 16px' }}>
          <Banner
            type="section"
            callout="OFFICIAL ANNOUNCEMENT"
            header={latestAnnouncement.title}
            description={latestAnnouncement.content}
            before={<Sparkles size={24} color="#0B536F" />}
          />
        </div>
      )}

      {/* Academic Curriculum Section */}
      <Section header="Academic Curriculum" footer="Browse approved semester courses, slides, and past exam questions">
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-icon-img" alt="L100" />}
          subhead="YEAR 1"
          subtitle="Calculus, Algebra, Descriptive Statistics, Probability I"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(100)}
        >
          Level 100
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-icon-img" alt="L200" />}
          subhead="YEAR 2"
          subtitle="Probability Distributions, Statistical Computing, Linear Models"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(200)}
        >
          Level 200
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-icon-img" alt="L300" />}
          subhead="YEAR 3"
          subtitle="Statistical Inference, Regression Analysis, Stochastic Processes"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(300)}
        >
          Level 300
        </Cell>
        <Cell
          before={<img src="/img/nav-courses.png" className="cell-icon-img" alt="L400" />}
          subhead="YEAR 4"
          subtitle="Multivariate Methods, Time Series, Biostatistics, Project Thesis"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectLevel(400)}
        >
          Level 400
        </Cell>
      </Section>

      {/* Beyond Curriculum Competencies Section */}
      <Section header="Beyond Curriculum — Practical Skills" footer="Specialized technical competencies and career development">
        <Cell
          before={<img src="/img/track-ds.png" className="cell-icon-img" alt="AI & ML" />}
          subhead="MACHINE LEARNING & DATA"
          subtitle="Supervised learning, deep learning, PyTorch, predictive analytics"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('ds_ml')}
        >
          AI & ML
        </Cell>
        <Cell
          before={<img src="/img/track-code.png" className="cell-icon-img" alt="Software" />}
          subhead="COMPUTATIONAL TOOLS"
          subtitle="R Studio, Python, SQL databases, LaTeX academic writing"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('prog_tools')}
        >
          SOFTWARE
        </Cell>
        <Cell
          before={<img src="/img/track-career.png" className="cell-icon-img" alt="Careers" />}
          subhead="INDUSTRY & OPPORTUNITIES"
          subtitle="Data analyst internships, CV guides, scholarship portals"
          after={<ChevronRight size={18} color="#94A3B8" />}
          onClick={() => onSelectPillar('career_growth')}
        >
          CAREERS
        </Cell>
        <Cell
          before={<img src="/img/track-research.png" className="cell-icon-img" alt="Research" />}
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
