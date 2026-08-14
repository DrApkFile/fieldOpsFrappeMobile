import { Lead } from '../types';

export const STAGE_PROBABILITY: Record<Lead['stage'], number> = {
  New: 0.1,
  Contacted: 0.25,
  Qualified: 0.5,
  Proposal: 0.75,
  Closed: 1.0,
};

export const PIPELINE_STAGES: Lead['stage'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];

/** Leads store value as a formatted string like "₦180,000" — parse back to a number. */
export function parseLeadValue(value: string): number {
  const digits = value.replace(/[^0-9.]/g, '');
  return digits ? parseFloat(digits) : 0;
}

export function getTotalPipelineValue(leads: Lead[]): number {
  return leads.reduce((acc, l) => acc + parseLeadValue(l.value), 0);
}

export function getWeightedPipelineValue(leads: Lead[]): number {
  return leads.reduce((acc, l) => acc + parseLeadValue(l.value) * STAGE_PROBABILITY[l.stage], 0);
}

/** A lead is overdue when it has a nextActionDate strictly before today. */
export function getOverdueLeads(leads: Lead[], todayIso: string = new Date().toISOString().slice(0, 10)): Lead[] {
  return leads.filter((l) => l.nextActionDate && l.nextActionDate < todayIso);
}

export interface StageBreakdownEntry {
  stage: Lead['stage'];
  count: number;
  value: number;
}

export function getStageBreakdown(leads: Lead[]): StageBreakdownEntry[] {
  return PIPELINE_STAGES.map((stage) => {
    const stageLeads = leads.filter((l) => l.stage === stage);
    return {
      stage,
      count: stageLeads.length,
      value: getTotalPipelineValue(stageLeads),
    };
  });
}

/** Share of leads that have reached Closed. */
export function getConversionRate(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  const closed = leads.filter((l) => l.stage === 'Closed').length;
  return closed / leads.length;
}
