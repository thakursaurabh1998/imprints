import React from 'react';

import styles from './Badge.module.css';

export default function Badge({
  tone = 'neutral',
  mono = false,
  dot = false,
  children,
}: {
  tone?: 'neutral' | 'accent' | 'danger' | 'success';
  mono?: boolean;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[styles.badge, styles[tone], mono && styles.mono]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
