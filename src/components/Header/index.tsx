import Link from 'next/link';

import config from '@/config';
import { IS_PRODUCTION } from '@/utils/constants';
import styles from './Header.module.css';

interface HeaderProps {
  openDrawer: () => void;
}

export default function Header({ openDrawer }: HeaderProps) {
  return (
    <div id={styles.navbar}>
      <div className={styles.row}>
        <span id={styles.title}>
          <Link href="/">
            <strong>{config.header.title.toUpperCase()}</strong>&nbsp;
            {config.header.subtitle.toUpperCase()}
          </Link>
        </span>
        <div className={styles.actions}>
          {!IS_PRODUCTION && (
            <span id={styles.about} className={styles['admin-link']}>
              <Link href="/admin/collections">ADMIN</Link>
            </span>
          )}
          <span id={styles.about}>
            <button type="button" onClick={openDrawer}>
              ABOUT
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
