import { Grid, Link } from '@mui/material';

import config from '@/config';
import { IS_PRODUCTION } from '@/utils/constants';
import styles from './Header.module.css';

interface HeaderProps {
  openDrawer: () => void;
}

export default function Header({ openDrawer }: HeaderProps) {
  return (
    <div id={styles.navbar}>
      <Grid
        container
        alignItems="center"
        justifyContent="start"
        direction="row"
        display="flex"
      >
        <Grid item xs={10}>
          <span id={styles.title}>
            <Link href="/" underline="none">
              <strong>{config.header.title.toUpperCase()}</strong>&nbsp;
              {config.header.subtitle.toUpperCase()}
            </Link>
          </span>
        </Grid>
        <Grid item xs={2}>
          <Grid container justifyContent="end" direction="row" display="flex">
            {!IS_PRODUCTION && (
              <span id={styles.about} style={{ marginRight: 50 }}>
                <Link href="/admin/collections" underline="none">
                  ADMIN
                </Link>
              </span>
            )}
            <span id={styles.about}>
              <Link onClick={openDrawer} underline="none">
                ABOUT
              </Link>
            </span>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
