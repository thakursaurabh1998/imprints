import collections from '../public/resource/collections.json';
import { Collection } from './utils/collection-config';

const config = {
  author: 'Saurabh Thakur',
  image_fulls_loc: '/images/fulls',
  image_thumbs_loc: '/images/thumbs',
  google_tag: 'G-VNMJYBCT8F',
  baseUrl: 'https://imprints.saurabhthakur.dev',

  title: 'Imprints by Saurabh Thakur',
  subtitle: 'A display of pictures that I captured',
  header: { title: 'Imprints', subtitle: 'by Saurabh Thakur' },
  footer: {
    name: 'Hey there, my name is Saurabh',
    bio: 'I like to click pictures of moments or things that I always want to keep with me forever and this is a place where I would like to share them with the world. There is a ton of beauty around us and this is my way to safeguard it forever.',
  },
  social: {
    github: 'https://github.com/thakursaurabh1998',
    twitter: 'thakursaurabh98',
  },

  collections: collections as Collection[],
};

export default config;
