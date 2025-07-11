// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// Set the env variable to false so the excalidraw npm package doesn't throw
// process undefined as docusaurus doesn't expose env variables by default

process.env.IS_PREACT = "false";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "R2 Ditu developer docs",
  tagline:
    "For R2 Ditu contributors or those integrating the R2 Ditu editor",
  url: "https://docs.r2-ditou.robinsai.world",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
  organizationName: "rebots-online", // Usually your GitHub org/user name.
  projectName: "r2-ditu", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/excalidraw/excalidraw/tree/master/dev-docs/",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.scss")],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "R2 Ditu",
        logo: {
          alt: "R2 Ditu Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            to: "/docs",
            position: "left",
            label: "Docs",
          },
          {
            to: "https://blog.r2-ditou.robinsai.world",
            label: "Blog",
            position: "left",
          },
          {
            to: "https://github.com/excalidraw/excalidraw",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Get Started",
                to: "/docs",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/UexuTaE",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/excalidraw",
              },
              {
                label: "Linkedin",
                href: "https://www.linkedin.com/company/excalidraw",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "https://blog.r2-ditou.robinsai.world",
              },
              {
                label: "GitHub",
                to: "https://github.com/excalidraw/excalidraw",
              },
            ],
          },
        ],
        copyright: `Copyright © 2023 Excalidraw community. Built with Docusaurus ❤️`,
      },
      prism: {
        theme: require("prism-react-renderer/themes/dracula"),
      },
      image: "img/og-image-2.png",
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      tableOfContents: {
        maxHeadingLevel: 4,
      },
      algolia: {
        appId: "8FEAOD28DI",
        apiKey: "4b07cca33ff2d2919bc95ff98f148e9e",
        indexName: "excalidraw",
      },
    }),
  themes: ["@docusaurus/theme-live-codeblock"],
  plugins: [
    "docusaurus-plugin-sass",
    [
      "docusaurus2-dotenv",
      {
        systemvars: true,
      },
    ],
    function () {
      return {
        name: "disable-fully-specified-error",
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false,
                  },
                },
              ],
            },
            optimization: {
              // disable terser minification
              minimize: false,
            },
          };
        },
      };
    },
  ],
};

module.exports = config;
