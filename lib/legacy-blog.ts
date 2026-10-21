import { legacyImageUrl } from "@/lib/legacy-assets";
import type { BlogPost } from "@/lib/sanity";

type ArchiveStory = Omit<BlogPost, "_id" | "mainImage" | "body"> & {
  image: string;
  alt: string;
  paragraphs: string[];
};

const stories: ArchiveStory[] = [
  {
    title: "Christmas of Hope",
    slug: { current: "christmas-of-hope" },
    excerpt: "A community celebration brought children together for learning, health conversations, and a day of joy.",
    publishedAt: "2024-12-21T09:00:00.000Z",
    programme: "community-development",
    focusArea: "community-engagement",
    author: "Spursbase Foundation Team",
    featured: true,
    image: "/img/DSC00204.jpg",
    alt: "Children taking part in the Christmas of Hope celebration",
    paragraphs: [
      "It started with a simple question. What if Christmas could last longer than a day?",
      "For many children across underserved communities, Christmas passes quietly. This time, Spursbase Foundation turned a single day into a moment children could carry with them.",
      "The space slowly filled with laughter and curiosity. Volunteers welcomed children and helped them feel seen from the very first moment.",
      "As the day unfolded, children sang, laughed, and joined in. Health professionals spoke with parents and children, opening conversations that rarely happen.",
      "Each child received a package with dignity and care. This was more than a celebration; it was a reminder that every child deserves moments of joy and belonging.",
    ],
  },
  {
    title: "Breast Cancer Awareness Program",
    slug: { current: "breast-cancer-awareness-program" },
    excerpt: "Students in four schools learned about breast cancer awareness, self-care, and the value of speaking up.",
    publishedAt: "2023-10-27T09:00:00.000Z",
    programme: "health-wellbeing",
    focusArea: "health-awareness",
    author: "Health Team",
    image: "/img/BCA029.jpg",
    alt: "Students participating in a health awareness programme",
    paragraphs: [
      "Students in the Mafi communities gathered for a programme designed to replace fear with knowledge and silence with understanding.",
      "Spursbase Foundation visited four schools. Nurses spoke with students about breast cancer, its signs, and how early action can help protect health.",
      "Students were guided through self-awareness practices and encouraged to pay attention to their bodies and speak up when something feels wrong.",
      "Across the four schools, confidence grew, awareness deepened, and conversations began. Health is part of education, and every young person deserves the knowledge to care for themselves.",
    ],
  },
  {
    title: "Send a Child Back to School",
    slug: { current: "send-a-child-back-to-school" },
    excerpt: "School supplies helped students begin the term with greater confidence and the tools to learn.",
    publishedAt: "2025-06-10T09:00:00.000Z",
    programme: "education",
    focusArea: "education-access",
    author: "Education Team",
    image: "/img/IMG_0416.jpg",
    alt: "School supplies prepared for children",
    paragraphs: [
      "For some children, going back to school is exciting. For others, it comes with quiet worry.",
      "Not having a bag, books, or even a pen can make a child feel left behind before learning begins.",
      "Spursbase Foundation volunteers worked across communities to identify children who needed support and provide essential school supplies.",
      "The supplies gave students a practical, confident start to the school term. Sometimes, all a child needs is a chance to begin again.",
    ],
  },
  {
    title: "Pad the Girl Child",
    slug: { current: "pad-the-girl-child" },
    excerpt: "A safe space for menstrual health conversations helped girls ask questions and access practical support.",
    publishedAt: "2025-05-22T09:00:00.000Z",
    programme: "health-wellbeing",
    focusArea: "menstrual-health",
    author: "Health Team",
    image: "/img/_DSC0179.jpg",
    alt: "Girls taking part in a menstrual health education session",
    paragraphs: [
      "Many girls face monthly challenges in silence, affecting confidence, attendance, and wellbeing.",
      "Spursbase Foundation created a safe space where girls could talk, ask questions, and learn without fear.",
      "What began with hesitation grew into open conversation. Girls shared their experiences and learned that they were not alone.",
      "Alongside practical support, the programme offered understanding and information. Sometimes, the most powerful change begins with a conversation.",
    ],
  },
  {
    title: "Vacation Learning Program",
    slug: { current: "vacation-learning-program" },
    excerpt: "Supportive vacation classes gave students another opportunity to build literacy, numeracy, and confidence.",
    publishedAt: "2025-04-15T09:00:00.000Z",
    programme: "education",
    focusArea: "literacy",
    author: "Education Team",
    image: "/img/IMG1.jpg",
    alt: "Students participating in a vacation learning class",
    paragraphs: [
      "When school closes, learning can become harder for children who have limited access to quiet study spaces and guidance.",
      "Spursbase Foundation created a supportive space where learning could continue in an engaging way.",
      "Students asked questions, grew more confident, and began to believe in their ability to learn.",
      "The programme showed what is possible when learning is personal, encouraging, and within reach.",
    ],
  },
  {
    title: "Women and Girls in Science",
    slug: { current: "women-and-girls-in-science" },
    excerpt: "Direct conversations with women in science helped girls picture themselves in future STEM careers.",
    publishedAt: "2025-03-30T09:00:00.000Z",
    programme: "policy-advocacy",
    focusArea: "girls-in-stem",
    author: "Advocacy Team",
    image: "/img/DSCN1468.jpg",
    alt: "Girls taking part in a Women and Girls in Science event",
    paragraphs: [
      "Sometimes, seeing is believing. Young girls met women working as engineers, doctors, and scientists.",
      "The event centred on real conversations and shared experiences, giving students the chance to ask questions and imagine new possibilities.",
      "By the end of the day, careers in science felt more visible and achievable.",
      "Representation can open doors in the mind and help young people see a place for themselves in fields where they have been underrepresented.",
    ],
  },
  {
    title: "Community Engagement",
    slug: { current: "community-engagement" },
    excerpt: "Listening first helped community members shape ideas and take part in practical local action.",
    publishedAt: "2025-02-18T09:00:00.000Z",
    programme: "community-development",
    focusArea: "community-engagement",
    author: "Community Team",
    image: "/img/BCA029.jpg",
    alt: "Community members meeting and sharing ideas",
    paragraphs: [
      "Real change grows from within a community. Spursbase Foundation worked alongside local people, listening before acting.",
      "Conversations turned into ideas, and ideas became opportunities for action.",
      "In one gathering, women formed a circle that grew into a support system for one another.",
      "When people feel heard, they can create change together.",
    ],
  },
  {
    title: "Read the World Quiz Competition",
    slug: { current: "read-the-world-quiz-competition" },
    excerpt: "A friendly quiz gave students a stage to demonstrate what they know and build confidence.",
    publishedAt: "2023-07-17T09:00:00.000Z",
    programme: "education",
    focusArea: "literacy",
    author: "Education Team",
    image: "/img/RTWQ0019.jpg",
    alt: "Students competing in the Read the World quiz",
    paragraphs: [
      "The room was filled with energy as students prepared to compete.",
      "This was more than a quiz. It was a moment for students to be seen and celebrate what they had learned.",
      "Confidence grew with every question answered. When one student answered a difficult question, the room erupted in applause.",
      "Every child left with a reason to believe in themselves and the value of learning.",
    ],
  },
];

function paragraphBlock(text: string, index: number) {
  return {
    _type: "block",
    _key: `paragraph-${index}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `span-${index}`, text, marks: [] }],
  };
}

export const legacyBlogPosts: BlogPost[] = stories.map((story) => ({
  _id: `archive-${story.slug.current}`,
  title: story.title,
  slug: story.slug,
  excerpt: story.excerpt,
  publishedAt: story.publishedAt,
  programme: story.programme,
  focusArea: story.focusArea,
  author: story.author,
  mainImage: {
    alt: story.alt,
    asset: { url: legacyImageUrl(story.image) ?? undefined },
  },
  body: story.paragraphs.map(paragraphBlock),
}));

export function getLegacyBlogPost(slug: string) {
  return legacyBlogPosts.find((post) => post.slug.current === slug) ?? null;
}
