import { Node, mergeAttributes } from "@tiptap/core";
import "katex/dist/katex.min.css";
import katex from "katex";

export const MathNode = Node.create({
  name: "math",

  group: "inline",

  inline: true,

  addAttributes() {
    return {
      content: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-content"),
        renderHTML: (attributes) => ({
          "data-content": attributes.content,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-type='math']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-type": "math" }, HTMLAttributes)];
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement("span");
      try {
        katex.render(node.attrs.content, span, { throwOnError: false });
      } catch {
        span.textContent = node.attrs.content;
      }
      return { dom: span };
    };
  },
});
