import React from 'react';

import Spinner from '../Spinner';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm' | 'icon';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export default function Button(props: ButtonProps | AnchorProps) {
  const {
    variant = 'secondary',
    size = 'md',
    loading = false,
    children,
    className,
    ...rest
  } = props as CommonProps & {
    className?: string;
    href?: string;
  } & Record<string, unknown>;

  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  if (typeof rest.href === 'string') {
    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
      >
        {children}
      </a>
    );
  }

  const { disabled, ...buttonRest } =
    rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type="button"
      {...buttonRest}
      disabled={disabled || loading}
      className={classes}
    >
      {loading && <Spinner size={13} />}
      {children}
    </button>
  );
}
