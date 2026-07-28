export type ApproachItem = {
  index: string;
  title: string;
  body: string;
  caseStudyUrl?: string;
};

const CASE_STUDY_URL =
  "https://drive.google.com/file/d/1jG7NmC3lHWAtQuysw_hNQDOclS7dnRRM/view?usp=sharing";

export const approachItems: ApproachItem[] = [
  {
    index: "01 / 03",
    title: "Brand Systems",
    body: "Visual identities, guidelines and flexible systems designed to help organisations and brands communicate clearly, enabling teams and partners to carry a shared visual language forward.",
    caseStudyUrl: CASE_STUDY_URL,
  },
  {
    index: "02 / 03",
    title: "Multi-channel Design",
    body: "Translating complex ideas into publications, digital experiences, data visualisations and motion, creating consistent narratives across different channels.",
    caseStudyUrl: CASE_STUDY_URL,
  },
  {
    index: "03 / 03",
    title: "Collaboration & Live Delivery",
    body: "Working with teams, communities and stakeholders to bring ideas from concept to reality through campaigns, events and physical experiences.",
  },
];
