import React from 'react';

import styles from './Toolbar.module.css';

export default function Toolbar({
  label,
  children,
}: {
  label: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.toolbar} role="region" aria-label="Bulk actions">
      <span className={styles.label}>{label}</span>
      {children && <span className={styles.divider} />}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
