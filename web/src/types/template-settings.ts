/**
 * Template Settings Types
 * Customizable settings for JIRA ticket generation
 */

/** Available issue types */
export type IssueType = 'Bug' | 'Task' | 'Story' | 'Epic' | 'Sub-task'

/** Priority levels */
export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'

/** Work hours configuration */
export interface WorkHoursConfig {
  min: number
  max: number
}

/** Label configuration */
export interface LabelConfig {
  maxPerTicket: number
  suggestions: string[]
}

/** Priority rule configuration */
export interface PriorityRulesConfig {
  defaultPriority: Priority
  keywords: {
    high: string[]
    low: string[]
  }
}

/** Main template settings interface */
export interface TemplateSettings {
  /** Work hour range per ticket */
  workHours: WorkHoursConfig
  
  /** Enabled issue types for ticket creation */
  enabledIssueTypes: IssueType[]
  
  /** Default issue type for ambiguous cases */
  defaultIssueType: IssueType
  
  /** Label settings */
  labels: LabelConfig
  
  /** Description template in markdown format */
  descriptionTemplate: string
  
  /** Priority determination rules */
  priorityRules: PriorityRulesConfig
  
  /** Custom instructions appended to AI prompt */
  customInstructions: string
}

/** Default template settings */
export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  workHours: {
    min: 2,
    max: 8,
  },
  enabledIssueTypes: ['Bug', 'Task', 'Story', 'Epic', 'Sub-task'],
  defaultIssueType: 'Task',
  labels: {
    maxPerTicket: 3,
    suggestions: [
      'frontend',
      'backend',
      'api',
      'database',
      'auth',
      'ui',
      'performance',
      'security',
      'testing',
      'documentation',
    ],
  },
  descriptionTemplate: `## Overview
{overview}

## Acceptance Criteria
- [ ] {criteria}

## Technical Notes
{notes}`,
  priorityRules: {
    defaultPriority: 'Medium',
    keywords: {
      high: ['urgent', 'critical', 'blocker', 'security', 'crash', 'down'],
      low: ['minor', 'enhancement', 'nice-to-have', 'cosmetic', 'typo'],
    },
  },
  customInstructions: '',
}

/** Storage key for localStorage */
export const TEMPLATE_SETTINGS_STORAGE_KEY = 'Project-K-template-settings'
