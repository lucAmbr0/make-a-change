import type { MetadataRoute } from "next";
import branding from "./components/logic/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.appName,
    short_name: branding.appName,
    description: branding.appDescription,
    shortcuts: [
      {
        name: "Crea campagna",
        short_name: "Crea campagna",
        url: "/campagne/crea",
        icons: [
          {
            src: "/logo2_rounded.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "it",
    background_color: branding.themePalette[0],  // #fdf3f3
    theme_color: branding.themePalette[6],        // #cc3636
    categories: ["social", "forums", "utilities"],
    icons: [
      // {
      //   src: "/logo2_rounded.png",
      //   sizes: "any",
      //   type: "image/png",
      //   purpose: "any",
      // },
      {
        src: "/maskable_icon_x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/maskable_icon_x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/maskable_icon_x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/maskable_icon_max.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
