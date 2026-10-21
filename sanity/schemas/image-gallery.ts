import { defineField, defineType } from "sanity";

export const imageGallery = defineType({
  name: "imageGallery",
  title: "Image gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
        },
      ],
      validation: (rule) => rule.required().min(2),
    }),
  ],
  preview: {
    select: { media: "images.0", images: "images" },
    prepare({ media, images }) {
      const count = Array.isArray(images) ? images.length : 0;
      return { title: `Image gallery (${count} images)`, media };
    },
  },
});
