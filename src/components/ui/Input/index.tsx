import React from 'react';

import styles from './Input.module.css';

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : (
        hint && <span className={styles.hint}>{hint}</span>
      )}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
};

export function Input({
  label,
  hint,
  error,
  mono = false,
  className,
  ...rest
}: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <input
        {...rest}
        className={[
          styles.control,
          mono && styles.mono,
          error && styles.invalid,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </FieldShell>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  ...rest
}: TextareaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <textarea
        {...rest}
        className={[
          styles.control,
          styles.textarea,
          error && styles.invalid,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </FieldShell>
  );
}
