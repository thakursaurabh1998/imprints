import React from 'react';

import styles from './Panel.module.css';

export default function Panel({
  title,
  actions,
  padded = true,
  className,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {actions}
        </header>
      )}
      <div className={padded ? styles.pad : undefined}>{children}</div>
    </section>
  );
}
