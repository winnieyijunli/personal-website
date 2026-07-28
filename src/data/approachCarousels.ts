export type CarouselCaptionStyle = "full" | "minimal";
export type CarouselAspect = "4:3" | "16:9" | "1:1";
export type CarouselMediaFit = "cover" | "contain";

export type CarouselSlide = {
  // null renders a plain placeholder block instead of a broken <img> —
  // used for sections whose real photography isn't ready yet.
  image: string | null;
  // if set, rendered instead of `image` — an autoplaying, muted, looped
  // <video> in the same frame/aspect the image would have used.
  video?: string;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
};

export type ApproachCarouselConfig = {
  aspect: CarouselAspect;
  captionStyle: CarouselCaptionStyle;
  // "cover" (default) crops to fill the frame — right for straight
  // photography shot close enough to the target ratio. "contain"
  // letterboxes instead, revealing the panel's own background in the
  // gutters rather than cropping or stretching — used here because the
  // multi-channel section's source files are 2:1, 2.5:1, ~3:2 and 16:9,
  // none actually 4:3, and cropping UI/design mockups risks cutting off
  // the content that matters.
  mediaFit?: CarouselMediaFit;
  slides: CarouselSlide[];
};

// Keyed by the matching approachItems[].index (see ./approach.ts) so
// Approach.tsx can look up each panel's carousel config directly.
export const approachCarousels: Record<string, ApproachCarouselConfig> = {
  "01 / 03": {
    aspect: "16:9",
    captionStyle: "full",
    slides: [
      {
        image: null,
        video: "/work/branding_1.mp4",
        title: "Hanguko",
        description:
          "A coffee brand identity inspired by Yunnan landscapes and Lahu cultural traditions, translating cultural memory into a contemporary visual language.",
      },
      {
        image: null,
        video: "/work/branding_2.mp4",
        title: "Climate Change and Migration Data",
        description:
          "A global visual identity system for a climate migration programme across 20+ countries, balancing local adaptation with global consistency.",
      },
      {
        image: null,
        video: "/work/branding_3.mp4",
        title: "Global Shared Services Centre",
        description:
          "A human-centred visual identity system for UNDP GSSC, creating consistent communication across digital and print platforms.",
      },
    ],
  },
  "02 / 03": {
    aspect: "4:3",
    captionStyle: "full",
    mediaFit: "contain",
    slides: [
      {
        image: "/work/Multi_1.png",
        title: "Global Shared Services Centre 2025 Annual Report",
        subtitle: "Web Experience · Information Design",
        description:
          "Designed and developed a web-native annual report for UNDP GSSC, transforming operational data into an interactive digital narrative.",
        link: "https://gssc.info.undp.org/annual-report-2025",
      },
      {
        image: "/work/Multi_2.png",
        title: "UN Services Offering Microsite",
        subtitle: "Web Experience · Service Communication",
        description:
          "Designed a global microsite for UN partner entities, translating complex service offerings into a clear and accessible digital experience.",
        link: "https://www.undp.org/un-agency-service-offering",
      },
      {
        image: "/work/Multi_3.png",
        title: "Climate Change and Migration Data Programme Brochure",
        subtitle: "Publication Design · Brand Application",
        description: "Applied the CCMD visual identity system to a flagship publication for partners and donors.",
        link: "https://denmark.iom.int/sites/g/files/tmzbdl1306/files/documents/2025-10/ccmd-booklet-2025.pdf",
      },
      {
        // .gif via a plain <img> autoplays/loops natively — no video
        // element or JS playback control needed or possible for it.
        image: "/work/Multi_4.gif",
        title: "UN Concept Explainer",
        subtitle: "Motion Design · Digital Storytelling",
        description:
          "Transformed the complex concept of multilateralism into an accessible visual narrative through motion graphics.",
        link: "https://vimeo.com/1144341464",
      },
    ],
  },
  "03 / 03": {
    aspect: "4:3",
    captionStyle: "minimal",
    slides: [
      {
        image: "/work/Event_1.jpeg",
        title: "IOM Knowledge Sharing Session",
        subtitle: "UN City Copenhagen · 2024",
      },
      {
        image: "/work/Event_2.jpg",
        title: "UNDP ITM Team Gathering",
        subtitle: "UN City Copenhagen · 2026",
      },
      {
        image: "/work/Event_3.jpeg",
        title: "IOM Panel Discussion",
        subtitle: "University of Copenhagen · 2024",
      },
      {
        image: "/work/Event_4.jpeg",
        title: "IOM Panel Discussion",
        subtitle: "University of Copenhagen · 2024",
      },
      {
        image: "/work/Event_5.jpeg",
        title: "IOM Panel Discussion",
        subtitle: "University of Copenhagen · 2024",
      },
      {
        image: "/work/Event_6.jpeg",
        title: "IOM Student Engagement Session",
        subtitle: "Copenhagen · 2025",
      },
      {
        image: "/work/Event_7.JPG",
        title: "UNDP ITM Team Gathering",
        subtitle: "UN City Copenhagen · 2026",
      },
      {
        image: "/work/Event_8.jpeg",
        title: "IOM Film Screening",
        subtitle: "UN City Copenhagen · 2025",
      },
    ],
  },
};
