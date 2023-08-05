import { notFound } from 'next/navigation';

import { IS_PRODUCTION } from './constants';

export function hideInProduction() {
  if (IS_PRODUCTION) {
    notFound();
  }
}
