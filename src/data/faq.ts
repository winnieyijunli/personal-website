export type FaqItem = {
  question: string;
  answer: string[];
};

export const faqStatement = {
  prefix: "Build meaning through research, iteration, and ",
  accent: "exploration",
  suffix: ".",
};

export const faqItems: FaqItem[] = [
  {
    question: "My Process",
    answer: [
      "I begin by continuously questioning and refining ideas until I feel they have reached a meaningful direction — or until I encounter a creative dead end. Throughout the process, I actively seek feedback from clients and project teams, allowing different perspectives to shape and strengthen the outcome.",
      "When a new perspective or a more compelling idea emerges, I return to the beginning: sketching by hand, exploring concepts, and rebuilding the design from the ground up. This cycle of exploration and refinement often repeats two or three times before reaching the final outcome.",
      "I also find inspiration in the work of artists I admire. When encountering exceptional work, I often reflect on what is missing from my own practice and what new possibilities I can explore.",
    ],
  },
  {
    question: "My Focus",
    answer: [
      "I aim to create visual systems guided by a simple accent or visual thread — a subtle element that helps audiences navigate the story behind a brand.",
      "Through thoughtful details and layered compositions, I seek to create work that feels rich and meaningful while remaining clear and accessible.",
      "I believe strong visual communication should be able to stand independently, allowing ideas to be understood through a universal visual language rather than relying on extensive explanation.",
    ],
  },
  {
    question: "My Tools",
    answer: [
      "My process often begins away from the screen: writing down words, collecting references, and sketching visual ideas by hand.",
      "I then move into digital tools to refine compositions, proportions, and visual systems with greater precision.",
      "Beyond digital design, I hope to continue experimenting with physical materials — exploring different textures, pigments, and canvases to bring more tactile qualities into my practice.",
    ],
  },
  {
    question: "Embracing Imperfection",
    answer: [
      "I see mistakes, unfinished ideas, and continuous refinement as essential parts of the creative process.",
      "Rather than viewing imperfection as something to eliminate, I see it as a sign of exploration and growth — a reflection of the energy and life behind every evolving piece of work.",
    ],
  },
];
