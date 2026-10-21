import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "programme",
      title: "Programme",
      type: "string",
      options: {
        list: [
          { title: "Education", value: "education" },
          { title: "Health & Wellbeing", value: "health-wellbeing" },
          { title: "Community Development", value: "community-development" },
          { title: "Policy & Advocacy", value: "policy-advocacy" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "focusArea",
      title: "Focus area",
      type: "string",
      options: {
        list: [
          { title: "Education access", value: "education-access" },
          { title: "Literacy", value: "literacy" },
          { title: "Girls' education", value: "girls-education" },
          { title: "Girls in STEM", value: "girls-in-stem" },
          { title: "Menstrual health", value: "menstrual-health" },
          { title: "Health awareness", value: "health-awareness" },
          { title: "Community engagement", value: "community-engagement" },
          { title: "Youth skills", value: "youth-skills" },
          { title: "Child wellbeing", value: "child-wellbeing" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author or team",
      type: "string",
      initialValue: "Spursbase Foundation",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "featured",
      title: "Feature this story",
      type: "boolean",
      initialValue: false,
      description: "Featured stories appear first in the blog listing.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "body",
      title: "Article body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }, { title: "Numbered", value: "number" }],
          marks: {
            decorators: [{ title: "Strong", value: "strong" }, { title: "Emphasis", value: "em" }],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({ name: "href", type: "url", title: "URL", validation: (rule) => rule.required() }),
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        },
        { type: "imageGallery" },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  orderings: [
    { title: "Featured, then newest", name: "featuredAndDate", by: [{ field: "featured", direction: "desc" }, { field: "publishedAt", direction: "desc" }] },
    { title: "Publication date, newest", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", programme: "programme", publishedAt: "publishedAt", media: "mainImage" },
    prepare({ title, programme, publishedAt, media }) {
      const programmeTitle = {
        education: "Education",
        "health-wellbeing": "Health & Wellbeing",
        "community-development": "Community Development",
        "policy-advocacy": "Policy & Advocacy",
      }[programme as string] ?? "Programme not selected";
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString("en-GB") : "No publication date";
      return { title, subtitle: `${programmeTitle} · ${date}`, media };
    },
  },
});