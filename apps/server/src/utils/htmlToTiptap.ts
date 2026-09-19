import { JSDOM } from "jsdom";

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: {
    type: string;
    attrs?: Record<string, unknown>;
  }[];
};

function getTextContent(node: Node): string {
  return node.textContent?.trim() || "";
}

function convertInlineNode(node: Node): TiptapNode[] {
  if (node.nodeType === node.TEXT_NODE) {
    const text = node.textContent || "";

    if (!text) {
      return [];
    }

    return [
      {
        type: "text",
        text,
      },
    ];
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  const children = Array.from(element.childNodes).flatMap(
    convertInlineNode
  );

  if (tag === "br") {
    return [{ type: "hardBreak" }];
  }

  if (tag === "strong" || tag === "b") {
    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        { type: "bold" },
      ],
    }));
  }

  if (tag === "em" || tag === "i") {
    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        { type: "italic" },
      ],
    }));
  }

  if (tag === "u") {
    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        { type: "underline" },
      ],
    }));
  }

  if (tag === "s" || tag === "strike" || tag === "del") {
    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        { type: "strike" },
      ],
    }));
  }

  if (tag === "a") {
    const href = element.getAttribute("href");

    if (!href) {
      return children;
    }

    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        {
          type: "link",
          attrs: {
            href,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        },
      ],
    }));
  }

  if (tag === "code") {
    return children.map((child) => ({
      ...child,
      marks: [
        ...(child.marks || []),
        { type: "code" },
      ],
    }));
  }

  return children;
}

function convertBlockNode(node: Node): TiptapNode[] {
  if (node.nodeType === node.TEXT_NODE) {
    const text = node.textContent?.trim();

    if (!text) {
      return [];
    }

    return [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
          },
        ],
      },
    ];
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (
    /^h[1-6]$/.test(tag)
  ) {
    const level = Number(tag.substring(1));

    const content = Array.from(
      element.childNodes
    ).flatMap(convertInlineNode);

    return [
      {
        type: "heading",
        attrs: {
          level,
        },
        ...(content.length > 0 ? { content } : {}),
      },
    ];
  }

  if (tag === "p") {
    const content = Array.from(
      element.childNodes
    ).flatMap(convertInlineNode);

    return [
      {
        type: "paragraph",
        ...(content.length > 0 ? { content } : {}),
      },
    ];
  }

  if (tag === "blockquote") {
    const content = Array.from(
      element.childNodes
    ).flatMap(convertBlockNode);

    return [
      {
        type: "blockquote",
        ...(content.length > 0 ? { content } : {}),
      },
    ];
  }

  if (tag === "ul") {
    const content = Array.from(
      element.children
    ).flatMap(convertBlockNode);

    return [
      {
        type: "bulletList",
        content,
      },
    ];
  }

  if (tag === "ol") {
    const content = Array.from(
      element.children
    ).flatMap(convertBlockNode);

    return [
      {
        type: "orderedList",
        attrs: {
          start: 1,
        },
        content,
      },
    ];
  }

  if (tag === "li") {
    const children = Array.from(
      element.childNodes
    );

    const content: TiptapNode[] = [];

    const inlineNodes: TiptapNode[] = [];

    for (const child of children) {
      if (
        child.nodeType === child.ELEMENT_NODE &&
        ["ul", "ol"].includes(
          (child as HTMLElement).tagName.toLowerCase()
        )
      ) {
        continue;
      }

      inlineNodes.push(
        ...convertInlineNode(child)
      );
    }

    if (inlineNodes.length > 0) {
      content.push({
        type: "paragraph",
        content: inlineNodes,
      });
    }

    for (const child of children) {
      if (
        child.nodeType === child.ELEMENT_NODE &&
        ["ul", "ol"].includes(
          (child as HTMLElement).tagName.toLowerCase()
        )
      ) {
        content.push(
          ...convertBlockNode(child)
        );
      }
    }

    return [
      {
        type: "listItem",
        content,
      },
    ];
  }

  if (tag === "pre") {
    const code = element.querySelector("code");

    const text = code
      ? code.textContent || ""
      : element.textContent || "";

    return [
      {
        type: "codeBlock",
        ...(text
          ? {
            content: [
              {
                type: "text",
                text,
              },
            ],
          }
          : {}),
      }
    ];
  }

  if (tag === "hr") {
    return [
      {
        type: "horizontalRule",
      },
    ];
  }

  /*
   * Generic div/section/article/etc.
   *
   * We don't throw the structure away.
   * We recursively process its children.
   */
  return Array.from(
    element.childNodes
  ).flatMap(convertBlockNode);
}

export function htmlToTiptap(
  html: string
): TiptapNode {
  const dom = new JSDOM(
    `<div id="synapse-root">${html}</div>`
  );

  const root =
    dom.window.document.getElementById(
      "synapse-root"
    );

  if (!root) {
    return {
      type: "doc",
      content: [],
    };
  }

  const content = Array.from(
    root.childNodes
  ).flatMap(convertBlockNode);

  return {
    type: "doc",
    content,
  };
}