import React from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { PlusCircle } from 'lucide-react';

export function Header({ user, onRequestOpen }) {
  const initial = user?.first_name ? user.first_name[0].toUpperCase() : 'S';
  const displayName = user?.first_name || 'Scholar';

  return (
    <header className="portal-header">
      <div className="portal-brand">
        <img src="/img/logo.png" alt="GASS" className="portal-logo" />
        <div className="portal-titles">
          <h1 className="portal-title">GASS-KNUST</h1>
          <p className="portal-slogan">Statistics for Development</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button 
          size="s" 
          mode="filled" 
          onClick={onRequestOpen}
          style={{ background: '#E00613', color: '#FFFFFF', borderRadius: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', height: '32px' }}
        >
          <PlusCircle size={14} />
          Request
        </Button>
        <div className="user-badge">
          <div className="user-avatar">{initial}</div>
          <span className="user-name">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
