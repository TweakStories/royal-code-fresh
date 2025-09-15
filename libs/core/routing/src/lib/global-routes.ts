export const LABELS = {
  home: 'home',
  auth: 'authentication',
  user: 'User',
  profile: 'profile',
  settings: 'settings',
  product: 'product',
  challenges: 'challenges',
  social: 'social',
  stats: 'stats',
  avatar: 'avatar',
  achievements: 'achievements',
  notifications: 'notifications',
  help: 'help',
  about: 'about',
  contact: 'contact',
  faq: 'FAQ',
  privacy: 'privacy',
  nodes: 'nodes',
  quests: 'quests',
};

export const ROUTES = {
  home: '',
  auth: {
    path: LABELS.auth,
    login: `login`,
    signup: `${LABELS.auth}/signup`,
  },
  user: {
    path: LABELS.user,
      profile: `${LABELS.user}/profile`,
      settings: `${LABELS.user}/settings`,
  },
  product: {
    path: LABELS.product,
    detailPage: `${LABELS.product}/:id`,
  },
  challenges: {
    path: LABELS.challenges,
    overview: `${LABELS.challenges}/overview`,
    daily: `${LABELS.challenges}/daily`,
    weekly: `${LABELS.challenges}/weekly`,
    monthly: `${LABELS.challenges}/monthly`
  },
  social: {
    path: LABELS.social,
    friends: `${LABELS.social}/friends`,
    groups: `${LABELS.social}/groups`,
    leaderboard: `${LABELS.social}/leaderboard`
  },
  stats: {
    path: LABELS.stats,
    personal: `${LABELS.stats}/personal`
  },
  avatar: {
    path: LABELS.avatar,
    customization: `${LABELS.avatar}/customization`
  },
  achievements: {
    path: LABELS.achievements
  },
  notifications: {
    path: LABELS.notifications
  },
  help: {
    path: LABELS.help,
    center: `${LABELS.help}/center`
  },
  about: {
    path: LABELS.about,
    us: `${LABELS.about}/us`
  },
  contact: {
    path: LABELS.contact
  },
  faq: {
    path: LABELS.faq
  },
  privacy: {
    path: LABELS.privacy,
    policy: `${LABELS.privacy}/policy`
  },
  nodes: {
    path: LABELS.nodes,
    detail: `${LABELS.nodes}/:id`
  },
  quests: {
    path: LABELS.quests,
    detail: `${LABELS.quests}/:id`
  }
};
