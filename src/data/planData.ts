export interface Task {
  id: string;
  text: string;
  completed: boolean;
  resourceName?: string;
  resourceUrl?: string;
  description: string;
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  talkingPoints: string[];
  sociologyHooks: string;
  status: 'draft' | 'ready' | 'recorded';
  scriptOutline?: string;
}

export const INITIAL_PLAN: Phase[] = [
  // ... (keeping existing phases)
  {
    id: 'foundation',
    title: 'Phase 1: Foundation',
    description: 'Setting the sociological and psychological groundwork for Off Task.',
    tasks: [
      {
        id: 'f1',
        text: 'Define the "Why"',
        description: 'Establish the core sociology/psychology focus. What specific human behaviors will you dissect?',
        completed: false
      },
      {
        id: 'f2',
        text: 'Setup Distribution',
        description: 'Create a free account on Spotify for Podcasters.',
        completed: false,
        resourceName: 'Spotify for Podcasters',
        resourceUrl: 'https://podcasters.spotify.com/'
      },
      {
        id: 'f3',
        text: 'Brand Identity',
        description: 'Design a simple logo and cover art using Canva.',
        completed: false,
        resourceName: 'Canva (Free)',
        resourceUrl: 'https://www.canva.com/'
      }
    ]
  },
  {
    id: 'production',
    title: 'Phase 2: Production',
    description: 'Creating professional-grade content with zero budget.',
    tasks: [
      {
        id: 'p1',
        text: 'Recording Setup',
        description: 'Learn to use Audacity for high-quality audio recording and editing.',
        completed: false,
        resourceName: 'Audacity',
        resourceUrl: 'https://www.audacityteam.org/'
      },
      {
        id: 'p2',
        text: 'Record Episode 0',
        description: 'Introduce yourself and the "Off Task" concept. Keep it under 15 minutes.',
        completed: false
      },
      {
        id: 'p3',
        text: 'The "Shorts" Strategy',
        description: 'Identify 3 "Hot Topic" hooks from your episode to turn into vertical video.',
        completed: false
      }
    ]
  },
  {
    id: 'acquisition',
    title: 'Phase 3: Acquisition',
    description: 'Rapid listener expansion strategies.',
    tasks: [
      {
        id: 'a1',
        text: 'TikTok & Reels Launch',
        description: 'Post your "Hot Topic" clips. Focus on sociology of current events.',
        completed: false
      },
      {
        id: 'a2',
        text: 'Thread Engagement',
        description: 'Join psychology-focused Threads to find your initial core audience.',
        completed: false
      },
      {
        id: 'a3',
        text: 'Review Exchange',
        description: 'Network with other small podcasts in your niche for shout-outs.',
        completed: false
      }
    ]
  },
  {
    id: 'scaling',
    title: 'Phase 4: Scaling',
    description: 'Monetization and long-term brand development.',
    tasks: [
      {
        id: 's1',
        text: 'Build a Media Kit',
        description: 'Create a one-pager showing your listener demographics and growth.',
        completed: false
      },
      {
        id: 's2',
        text: 'Sponsorship Outreach',
        description: 'Identify 5 ethical brands aligned with psychology/well-being.',
        completed: false
      },
      {
        id: 's3',
        text: 'Listener Community',
        description: 'Start a free Discord or newsletter for deeper sociological discussions.',
        completed: false
      }
    ]
  }
];

export const INITIAL_EPISODES: Episode[] = [
  {
    id: 'e1',
    title: 'The Psychology of Ghosting',
    description: 'Why we disappear in the digital age and the sociological impact of weak ties.',
    talkingPoints: [
      'The rise of digital convenience vs human connection',
      'Attachment styles in online dating',
      'The "Disposable Person" phenomenon in sociology'
    ],
    sociologyHooks: 'How platform design influences empathy decay.',
    status: 'ready'
  }
];

export const RESOURCE_VAULT = [
  {
    name: 'Spotify for Podcasters',
    category: 'Distribution',
    description: 'The standard free tool for hosting and distributing to all platforms.',
    url: 'https://podcasters.spotify.com/'
  },
  {
    name: 'Audacity',
    category: 'Editing',
    description: 'Powerful, open-source audio editor for professional sound.',
    url: 'https://www.audacityteam.org/'
  },
  {
    name: 'Canva',
    category: 'Design',
    description: 'Essential for podcast art, social media clips, and media kits.',
    url: 'https://www.canva.com/'
  },
  {
    name: 'CapCut',
    category: 'Video',
    description: 'Free video editor optimized for TikTok/Reels growth.',
    url: 'https://www.capcut.com/'
  }
];

