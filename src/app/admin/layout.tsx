import React from 'react';

import { ToastProvider } from '@/components/ui';
import '@/styles/admin.css';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-root ${styles.shell}`}>
      <ToastProvider>
        <div className={styles.container}>{children}</div>
      </ToastProvider>
    </div>
  );
}
