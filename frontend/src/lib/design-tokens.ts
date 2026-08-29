export const brandColors = {
  primary: {
    default: 'text-brand-primary',
    bg: 'bg-brand-primary',
    bgLight: 'bg-brand-primary-light',
    hover: 'hover:bg-brand-primary-hover',
    focus: 'focus:ring-brand-primary-focus',
    border: 'border-brand-primary',
  },
  success: {
    default: 'text-brand-success',
    bg: 'bg-brand-success',
    bgLight: 'bg-brand-success-light',
    hover: 'hover:bg-brand-success-dark',
    border: 'border-brand-success-border',
  },
  danger: {
    default: 'text-brand-danger',
    bg: 'bg-brand-danger',
    bgLight: 'bg-brand-danger-light',
    hover: 'hover:bg-brand-danger-dark',
    border: 'border-brand-danger-border',
  },
  warning: {
    default: 'text-brand-warning',
    bg: 'bg-brand-warning',
    bgLight: 'bg-brand-warning-light',
    hover: 'hover:bg-brand-warning-dark',
    border: 'border-brand-warning-border',
  },
  info: {
    default: 'text-brand-info',
    bg: 'bg-brand-info',
    bgLight: 'bg-brand-info-light',
    hover: 'hover:bg-brand-info-dark',
    border: 'border-brand-info-border',
  },
  neutral: {
    default: 'text-brand-neutral',
    bg: 'bg-brand-neutral',
    bgLight: 'bg-brand-neutral-light',
    hover: 'hover:bg-brand-neutral-dark',
    border: 'border-brand-neutral-border',
    muted: 'text-brand-neutral-muted',
  },
} as const

export type BrandColorGroup = typeof brandColors[keyof typeof brandColors]
