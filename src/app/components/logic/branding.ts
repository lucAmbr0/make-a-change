const branding = {
  appName: "Make a Change",
  appMotto: "Crea il cambiamento",
  appDescription: "Prendi iniziativa e cambia le cose",
  openingDescription: "Ogni cambiamento inizia da una voce che si fa proposta. Qui puoi trasformare un'idea in azione, coinvolgere altre persone e dare forza a ciò che conta davvero. Insieme, le parole diventano pressione, la pressione diventa decisione, e la decisione diventa realtà. Se qualcosa deve migliorare, comincia da te, adesso, subito.",
  logo: "/logo2.png",
  campaignPlaceholderImage: "/campaign_placeholder_image.webp",
  repoName: "make-a-change",
  repoLink: "https://github.com/lucAmbr0/make-a-change",
  author: "lucAmbr0",
  authorLink: "https://github.com/lucAmbr0",
  projectLicense: "GPL-3.0",
  projectLicenseLink: "https://www.gnu.org/licenses/gpl-3.0.html",
  themePalette: [
    "#fdf3f3",
    "#fbe5e5",
    "#f9cfcf",
    "#f4adad",
    "#ec7d7d",
    "#e05353",
    "#cc3636",
    "#ab2a2a",
    "#902727",
    "#762626",
    "#400f0f",
  ],
} as const;

export type Branding = typeof branding;

export default branding;
