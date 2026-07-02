import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Prowl Review Docs",
  tagline: "BYOK AI code review — made for agents, controlled by humans",
  favicon: "img/favicon.ico",

  headTags: [
    { tagName: "link", attributes: { rel: "icon", type: "image/png", sizes: "32x32", href: "/img/favicon-32x32.png" } },
    { tagName: "link", attributes: { rel: "icon", type: "image/png", sizes: "16x16", href: "/img/favicon-16x16.png" } },
    { tagName: "link", attributes: { rel: "apple-touch-icon", sizes: "180x180", href: "/img/apple-touch-icon.png" } }
  ],

  url: "https://review.prowl.tools",
  baseUrl: "/",

  organizationName: "prowl-tools",
  projectName: "prowl-code-review-docs",

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw"
    }
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          editUrl: "https://github.com/prowl-tools/prowl-code-review-docs/edit/main/"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    image: "img/prowl-stickers-1.png",
    announcementBar: {
      id: "byok-banner",
      content:
        'BYOK AI code review with no rate limits. <a href="https://prowl.tools/code-review">See prowl-review →</a>',
      isCloseable: true
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    navbar: {
      title: "Prowl Review",
      logo: {
        alt: "Prowl Review",
        src: "img/prowl-logo.png"
      },
      items: [
        {
          type: "dropdown",
          label: "Docs",
          position: "right",
          items: [
            { label: "Prowl CLI", href: "https://docs.prowl.tools" },
            { label: "Code Review (this site)", href: "https://review.prowl.tools" },
            { label: "Prowl Hub", href: "https://hub.prowl.tools" },
            { label: "Prowl Infra", href: "https://infra.prowl.tools" },
            { label: "All docs ↗", href: "https://prowl.tools/docs" }
          ]
        },
        { href: "https://prowl.tools/code-review", label: "Product", position: "right" },
        { href: "https://prowl.tools", label: "Suite", position: "right" },
        { href: "https://github.com/prowl-tools/prowl-code-review", label: "GitHub", position: "right" },
        { href: "https://www.npmjs.com/package/prowl-review", label: "npm", position: "right" }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "/" },
            { label: "GitHub Action", to: "/github-action" },
            { label: "Configuration", to: "/configuration" }
          ]
        },
        {
          title: "Prowl Suite",
          items: [
            { label: "prowl.tools", href: "https://prowl.tools" },
            { label: "CLI Docs", href: "https://docs.prowl.tools" },
            { label: "Community Hub", href: "https://hub.prowl.tools" }
          ]
        },
        {
          title: "Resources",
          items: [
            { label: "GitHub", href: "https://github.com/prowl-tools/prowl-code-review" },
            { label: "npm", href: "https://www.npmjs.com/package/prowl-review" },
            { label: "Visit us on X", href: "https://x.com/prowlqa" }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Genkei Labs. Built with Docusaurus.`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "yaml", "json"]
    }
  } satisfies Preset.ThemeConfig
};

export default config;
