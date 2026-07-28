export const aboutBio: string[] = [
  "Before becoming a designer, I studied sociology and anthropology, exploring how people, cultures and institutions shape the way we understand the world. This background continues to influence my design practice: I approach each project through research, context and careful observation.",
  "My journey has taken me across different fields — from social research to international development — where I found myself working at the intersection of communication, design and storytelling.",
  "At UNDP and IOM, I have developed brand systems, digital platforms and publications that help organisations communicate across teams, countries and communities.",
  "Working within complex global environments has taught me that good design is not only about aesthetics. It is about creating structures, systems and visual languages that allow ideas to be understood, shared and carried forward by others.",
];

export type AboutPracticeItem = {
  title: string;
  description: string;
};

export const aboutPractice: AboutPracticeItem[] = [
  {
    title: "Brand Systems",
    description:
      "Building visual identities and flexible design systems that help organisations communicate consistently.",
  },
  {
    title: "Publication & Web Design",
    description:
      "Transforming complex information into clear, accessible and engaging digital and editorial experiences.",
  },
  {
    title: "Digital Storytelling",
    description: "Using visuals, structure and narrative to connect ideas with audiences.",
  },
];

export type AboutOutsideItem = {
  title: string;
  paragraphs: string[];
};

export const aboutOutside: AboutOutsideItem[] = [
  {
    title: "Curiosity Beyond the Screen",
    paragraphs: [
      "I am always collecting stories, images and ideas.",
      "Growing up surrounded by the landscapes and cultural diversity of Yunnan shaped my curiosity about people and place. Photography, travel and field observation remain important parts of how I understand the world.",
    ],
  },
  {
    title: "Exploring Through Experience",
    paragraphs: [
      "Outside design, you will usually find me visiting exhibitions, hiking, practicing Pilates, or searching for good coffee.",
      "I enjoy connecting different perspectives — from anthropology, art, technology and everyday life — into new ways of thinking.",
    ],
  },
  {
    title: "Observing, Learning, Connecting",
    paragraphs: [
      "My curiosity extends beyond design. Every conversation, place and experience becomes part of my visual vocabulary and influences how I create.",
    ],
  },
];

export type AboutPrinciple = {
  title: string;
  description: string;
};

export const aboutPrinciples: AboutPrinciple[] = [
  {
    title: "Systems over one-offs",
    description:
      "A brand is not a logo — it is a system of decisions that allows others to communicate consistently, even when the designer is not in the room.",
  },
  {
    title: "Clarity is the outcome",
    description:
      "If an idea cannot be understood and explained by others, the design is not complete yet.",
  },
  {
    title: "Design should travel",
    description:
      "A strong idea should work across formats and environments — from a PDF and webpage to a presentation or physical space. Design is built to move, adapt and connect.",
  },
];
