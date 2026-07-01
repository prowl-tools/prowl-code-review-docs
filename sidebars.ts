import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "getting-started",
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: ["configuration", "cli", "bot-commands"]
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: ["github-action", "ensemble", "grounding", "cross-file-context", "repo-wide-learnings"]
    },
    {
      type: "category",
      label: "Policy",
      collapsed: false,
      items: ["auth", "privacy"]
    },
    "example-review"
  ]
};

export default sidebars;
