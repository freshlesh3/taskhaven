import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const styles = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  dark: 'bg-ink-950 text-white hover:bg-ink-900 disabled:bg-ink-500',
  outline:
    'border border-ink-950/80 bg-white text-ink-950 hover:bg-ink-50 disabled:border-ink-300 disabled:text-ink-300',
  ghost: 'text-ink-900 hover:bg-ink-100',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:border-ink-200 disabled:text-ink-300',
} as const;

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

type Variant = keyof typeof styles;
type Size = keyof typeof sizes;

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
    styles[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = 'primary', size = 'md', className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
