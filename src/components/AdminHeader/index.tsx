import React from 'react';

import styles from './AdminHeader.module.css';

export default function AdminHeader({
  eyebrow,
  backHref,
  backLabel = 'Collections',
  title,
  badges,
  actions,
}: {
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  title: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.bar}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>
          {backHref ? (
            <a href={backHref} className={styles.back}>
              ← {backLabel}
            </a>
          ) : (
            eyebrow || 'Imprints admin'
          )}
        </span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badges}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
