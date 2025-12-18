import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'MeetingMind',
  description: 'Transform meeting transcripts into connected knowledge',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features/import' },
      { text: 'Pro', link: '/pro/overview' },
      { 
        text: 'Get Pro', 
        link: 'https://tumbucon.gumroad.com/l/meetingmind-pro'
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Settings Overview', link: '/guide/settings' },
            { text: 'Import Sources', link: '/guide/sources' },
            { text: 'Output Options', link: '/guide/output' }
          ]
        }
      ],
      '/features/': [
        {
          text: 'Core Features',
          items: [
            { text: 'Transcript Import', link: '/features/import' },
            { text: 'Auto-Linking', link: '/features/auto-linking' },
            { text: 'Participant Notes', link: '/features/participants' },
            { text: 'Folder Watcher', link: '/features/folder-watcher' },
            { text: 'Otter.ai Sync', link: '/features/otter-sync' }
          ]
        }
      ],
      '/pro/': [
        {
          text: 'Pro Features',
          items: [
            { text: 'Overview', link: '/pro/overview' },
            { text: 'AI Summaries', link: '/pro/summaries' },
            { text: 'Action Items', link: '/pro/action-items' },
            { text: 'Decisions', link: '/pro/decisions' },
            { text: 'Tag Suggestions', link: '/pro/tags' },
            { text: 'Participant Insights', link: '/pro/participant-insights' }
          ]
        },
        {
          text: 'Setup',
          items: [
            { text: 'License Activation', link: '/pro/license' },
            { text: 'API Keys', link: '/pro/api-keys' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pattynextdoor/meetingmind' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Patrick Tumbucon'
    },

    search: {
      provider: 'local'
    }
  }
})

