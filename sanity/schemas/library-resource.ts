import { defineField, defineType } from "sanity";

export const libraryResource = defineType({
  name: "libraryResource",
  title: "Library resource",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Programmes", value: "programmes" },
          { title: "Impact reports", value: "impact-reports" },
          { title: "Research & insights", value: "research" },
          { title: "Stories", value: "stories" },
          { title: "Guides & toolkits", value: "toolkits" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(260),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "file",
      title: "Downloadable file",
      type: "file",
      options: { accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" },
    }),
    defineField({
      name: "externalUrl",
      title: "External link",
      type: "url",
      description: "Optional destination for a programme page or related resource.",
    }),
    defineField({
      name: "body",
      title: "Resource details",
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
      ],
    }),
  ],
  orderings: [
    { title: "Publication date, newest", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
});