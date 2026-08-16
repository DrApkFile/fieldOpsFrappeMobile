import { LeadStage } from '../types';
import { Theme } from '../theme/theme';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStageColor(stage: LeadStage, theme: Theme): string {
  switch (stage) {
    case 'New': return theme.colors.primary;
    case 'Contacted': return theme.colors.amber;
    case 'Qualified': return theme.colors.tintPurpleIcon;
    case 'Proposal Sent': return theme.colors.teal;
    case 'Negotiation': return theme.colors.tintGoldIcon;
    case 'Converted': return theme.colors.emerald;
    case 'Lost': return theme.colors.red;
    default: return theme.colors.primary;
  }
}

export function formatShortDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}
