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

      {/* Official Telegram UI Cards for Competency Pillars */}
      <Section header="Featured Specializations" footer="Tap any card to view curated toolkits, software, and guides">
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 8px' }}>
          <Card type="plain" onClick={() => onSelectPillar('ds_ml')} style={{ minWidth: '150px', flexShrink: 0 }}>
            <Card.Cell subhead="MACHINE LEARNING" subtitle="PyTorch, AI, modeling">
              AI & ML
            </Card.Cell>
          </Card>

          <Card type="plain" onClick={() => onSelectPillar('prog_tools')} style={{ minWidth: '150px', flexShrink: 0 }}>
            <Card.Cell subhead="COMPUTATION" subtitle="R, Python, SQL, LaTeX">
              SOFTWARE
            </Card.Cell>
          </Card>

          <Card type="plain" onClick={() => onSelectPillar('career_growth')} style={{ minWidth: '150px', flexShrink: 0 }}>
            <Card.Cell subhead="INDUSTRY" subtitle="Internships & resumes">
              CAREERS
            </Card.Cell>
          </Card>

          <Card type="plain" onClick={() => onSelectPillar('research_thesis')} style={{ minWidth: '150px', flexShrink: 0 }}>
            <Card.Cell subhead="METHODOLOGY" subtitle="Biostats & Actuarial">
              RESEARCH
            </Card.Cell>
          </Card>
        </div>
      </Section>

      {/* Departmental Announcement Banner */}
      {latestAnnouncement && (
        <Banner
          type="section"
          callout="OFFICIAL ANNOUNCEMENT"
          header={latestAnnouncement.title}
          description={latestAnnouncement.content}
        />
      )}

      {/* Academic Curriculum Section */}
      <Section header="Academic Curriculum" footer="Browse approved semester courses, slides, and past exam questions">
        <Cell
          before={<Avatar size={40} acronym="L1" />}
          subhead="YEAR 1"
          subtitle="Calculus, Algebra, Descriptive Statistics, Probability I"
          after={<Icon24ChevronRight />}
          onClick={() => onSelectLevel(100)}
        >
          Level 100
        </Cell>
        <Cell
          before={<Avatar size={40} acronym="L2" />}
          subhead="YEAR 2"
          subtitle="Probability Distributions, Statistical Computing, Linear Models"
          after={<Icon24ChevronRight />}
          onClick={() => onSelectLevel(200)}
        >
          Level 200
        </Cell>
        <Cell
          before={<Avatar size={40} acronym="L3" />}
          subhead="YEAR 3"
          subtitle="Statistical Inference, Regression Analysis, Stochastic Processes"
          after={<Icon24ChevronRight />}
          onClick={() => onSelectLevel(300)}
        >
          Level 300
        </Cell>
        <Cell
          before={<Avatar size={40} acronym="L4" />}
          subhead="YEAR 4"
          subtitle="Multivariate Methods, Time Series, Biostatistics, Project Thesis"
          after={<Icon24ChevronRight />}
          onClick={() => onSelectLevel(400)}
        >
          Level 400
        </Cell>
      </Section>
    </List>
  );
}
