import React from 'react';
import { List, Section, Cell, Banner, InlineButtons, Card, Avatar } from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';

export function HomeTab({ stats, announcements, onSelectLevel, onSelectPillar }) {
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  return (
    <List>
      {/* Official Telegram UI Hero Banner */}
      <Banner
        type="section"
        before={<Avatar size={48} src="/img/logo.png" acronym="GS" />}
        callout="KNUST STATISTICS • ACADEMIC HUB"
        header="Welcome, Scholar 🎓"
        description="Verified course syllabi, lecture slides, past exam questions, and practical software guides."
      />

      {/* Official Telegram UI Inline Metric Buttons */}
      <InlineButtons mode="bezeled">
        <InlineButtons.Item text={`${stats?.totalUsers || 240} Students`}>
          <Icon28Stats />
        </InlineButtons.Item>
        <InlineButtons.Item text={`${stats?.totalResources || 58} Materials`}>
          <Icon28Archive />
        </InlineButtons.Item>
        <InlineButtons.Item text={`${stats?.pendingRequests !== undefined ? stats.pendingRequests : 3} Requests`}>
          <Icon28AddCircle />
        </InlineButtons.Item>
      </InlineButtons>

      {/* Featured Specializations with 3D Graphics (No Scrollbar) */}
      <Section header="Featured Specializations">
        <div 
          className="no-scrollbar" 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            padding: '4px 16px 12px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <Card 
            type="plain" 
            onClick={() => onSelectPillar('ds_ml')} 
            style={{ width: '135px', minWidth: '135px', flexShrink: 0, cursor: 'pointer' }}
          >
            <div className="card-graphic-wrapper">
              <img src="/img/track-ds.png" alt="AI & ML" />
            </div>
            <Card.Cell subhead="MACHINE LEARNING" subtitle="PyTorch, AI models">
              AI & ML
            </Card.Cell>
          </Card>

          <Card 
            type="plain" 
            onClick={() => onSelectPillar('prog_tools')} 
            style={{ width: '135px', minWidth: '135px', flexShrink: 0, cursor: 'pointer' }}
          >
            <div className="card-graphic-wrapper">
              <img src="/img/track-code.png" alt="Software" />
            </div>
            <Card.Cell subhead="COMPUTATION" subtitle="R, Python, SQL, LaTeX">
              SOFTWARE
            </Card.Cell>
          </Card>

          <Card 
            type="plain" 
            onClick={() => onSelectPillar('career_growth')} 
            style={{ width: '135px', minWidth: '135px', flexShrink: 0, cursor: 'pointer' }}
          >
            <div className="card-graphic-wrapper">
              <img src="/img/track-career.png" alt="Careers" />
            </div>
            <Card.Cell subhead="INDUSTRY" subtitle="Jobs & Internships">
              CAREERS
            </Card.Cell>
          </Card>

          <Card 
            type="plain" 
            onClick={() => onSelectPillar('research_thesis')} 
            style={{ width: '135px', minWidth: '135px', flexShrink: 0, cursor: 'pointer' }}
          >
            <div className="card-graphic-wrapper">
              <img src="/img/track-research.png" alt="Research" />
            </div>
            <Card.Cell subhead="METHODOLOGY" subtitle="Thesis & Biostats">
              RESEARCH
            </Card.Cell>
          </Card>
        </div>
      </Section>

      {/* Departmental Announcement Banner */}
      {latestAnnouncement && (
        <Banner
          type="section"
          className="announcement-banner"
          callout="OFFICIAL ANNOUNCEMENT"
          header={latestAnnouncement.title}
          description={latestAnnouncement.content}
        />
      )}

      {/* Academic Curriculum Section */}
      <Section header="Academic Curriculum">
        <Cell
          before={<div className="level-badge">L100</div>}
          subhead="YEAR 1"
          subtitle="Calculus, Algebra, Descriptive Statistics, Probability I"
          after={<Icon24ChevronRight />}
          onClick={() => {
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            onSelectLevel(100);
          }}
        >
          Level 100
        </Cell>
        <Cell
          before={<div className="level-badge">L200</div>}
          subhead="YEAR 2"
          subtitle="Probability Distributions, Statistical Computing, Linear Models"
          after={<Icon24ChevronRight />}
          onClick={() => {
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            onSelectLevel(200);
          }}
        >
          Level 200
        </Cell>
        <Cell
          before={<div className="level-badge">L300</div>}
          subhead="YEAR 3"
          subtitle="Statistical Inference, Regression Analysis, Stochastic Processes"
          after={<Icon24ChevronRight />}
          onClick={() => {
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            onSelectLevel(300);
          }}
        >
          Level 300
        </Cell>
        <Cell
          before={<div className="level-badge">L400</div>}
          subhead="YEAR 4"
          subtitle="Multivariate Methods, Time Series, Biostatistics, Thesis Project"
          after={<Icon24ChevronRight />}
          onClick={() => {
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            onSelectLevel(400);
          }}
        >
          Level 400
        </Cell>
      </Section>
    </List>
  );
}
