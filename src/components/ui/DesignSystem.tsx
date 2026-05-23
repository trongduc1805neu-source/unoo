import React from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'outline';
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export interface AppButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export interface AppBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'positive' | 'negative' | 'neutral' | 'accent';
  children: React.ReactNode;
  className?: string;
}

export interface AppSectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

export interface AppEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export interface AppAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  photoURL?: string;
  className?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Tạo màu avatar ổn định theo hash của tên */
function getAvatarColor(name: string): string {
  const palette = [
    'bg-[var(--color-accent)] text-white',
    'bg-[var(--color-secondary)] text-white',
    'bg-[var(--color-quaternary)] text-white',
    'bg-[var(--color-tertiary)] text-white',
    'bg-[#7C6EFA] text-white',
    'bg-[#E8684A] text-white',
    'bg-[#3D9A6C] text-white',
    'bg-[#B45EBF] text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─────────────────────────────────────────────
// AppCard
// ─────────────────────────────────────────────

const cardVariantClasses: Record<NonNullable<AppCardProps['variant']>, string> = {
  default:
    'bg-[var(--color-card-solid)] border border-[var(--color-border)] shadow-[var(--shadow-card-default)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-hover)]',
  muted:
    'bg-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
  outline:
    'bg-transparent border border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
};

export function AppCard({
  variant = 'default',
  children,
  className = '',
  ...props
}: AppCardProps) {
  return (
    <div
      className={`rounded-xl transition-all duration-200 ${cardVariantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// AppButton
// ─────────────────────────────────────────────

const buttonVariantClasses: Record<NonNullable<AppButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--color-accent)] text-white border-transparent shadow-[var(--shadow-button)] hover:brightness-105 hover:-translate-y-px active:scale-[0.97]',
  secondary:
    'bg-[var(--color-card-solid)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-muted)] active:scale-[0.97]',
  ghost:
    'bg-transparent text-[var(--color-foreground)] border border-transparent hover:bg-[var(--color-muted)] hover:border-[var(--color-border)] active:scale-[0.97]',
  danger:
    'bg-transparent text-red-500 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 active:scale-[0.97]',
};

const buttonSizeClasses: Record<NonNullable<AppButtonProps['size']>, string> = {
  sm: 'text-xs px-3 min-h-[32px] gap-1.5',
  md: 'text-sm px-4 min-h-[40px] gap-2',
  lg: 'text-sm px-6 min-h-[48px] gap-2 font-bold',
};

export function AppButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  isLoading = false,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium font-sans transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// AppBadge
// ─────────────────────────────────────────────

const badgeVariantClasses: Record<NonNullable<AppBadgeProps['variant']>, string> = {
  positive:
    'bg-[var(--color-green-light)] text-[var(--color-green-dark)] border border-[var(--color-green-light)]',
  negative:
    'bg-red-500/10 text-red-500 border border-red-500/20',
  neutral:
    'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]',
  accent:
    'bg-[var(--color-orange-light)] text-[var(--color-accent)] border border-[var(--color-border)]',
};

export function AppBadge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: AppBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-200 ${badgeVariantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// AppSectionHeader
// ─────────────────────────────────────────────

export function AppSectionHeader({
  icon,
  title,
  count,
  action,
  className = '',
}: AppSectionHeaderProps) {
  return (
    <div className={`flex justify-between items-center px-0.5 ${className}`}>
      <h3 className="font-heading font-bold text-[var(--color-foreground)] text-sm flex items-center gap-2">
        {icon && (
          <span className="text-[var(--color-accent)] flex items-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
        {count !== undefined && (
          <AppBadge variant="accent">{count}</AppBadge>
        )}
      </h3>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// AppEmptyState
// ─────────────────────────────────────────────

export function AppEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: AppEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-solid)] gap-3 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-heading font-bold text-sm text-[var(--color-foreground)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--color-muted-foreground)] font-medium leading-relaxed max-w-[220px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// AppAvatar
// ─────────────────────────────────────────────

const avatarSizeClasses: Record<NonNullable<AppAvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export function AppAvatar({
  name,
  size = 'md',
  photoURL,
  className = '',
}: AppAvatarProps) {
  const colorClass = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 border border-[var(--color-border)] shadow-sm flex items-center justify-center font-heading font-bold ${avatarSizeClasses[size]} ${photoURL ? '' : colorClass} ${className}`}
      aria-label={name}
      title={name}
    >
      {photoURL ? (
        <img src={photoURL} alt={`Ảnh đại diện của ${name}`} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
