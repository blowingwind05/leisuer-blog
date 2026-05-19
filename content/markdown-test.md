---
title: Markdown Syntax Test
description: A stress-test document for common Markdown, GFM, HTML, and Nuxt Content MDC syntax.
created: 2026-05-14
updated: 2026-05-14
category: Test
tags:
  - Markdown
  - Nuxt Content
  - MDC
  - Syntax
draft: true
---

# Markdown Syntax Test

This document is a playground for testing Markdown rendering. It intentionally includes many edge cases and visual patterns.

[Jump to tables](#tables) · [Jump to code](#code-blocks) · [Jump to MDC](#nuxt-content-mdc)

---

## Paragraphs And Line Breaks

This is a normal paragraph. It contains enough text to wrap across multiple lines so spacing, line height, and width can be inspected in the renderer.

This is another paragraph after a blank line.

This line ends with two spaces.  
This should render as a soft line break.

This line uses an HTML break.<br>
This should also appear on the next line.

## Inline Formatting

This sentence has **bold text**, *italic text*, ***bold italic text***, ~~strikethrough text~~, `inline code`, and a [normal link](https://example.com).

Autolinks should work too: <https://example.com> and <hello@example.com>.

Escaped characters: \*not italic\*, \# not a heading, \[not a link\].

## Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Blockquotes

> This is a simple blockquote.

> This is a multi-paragraph blockquote.
>
> It has a second paragraph.

> Nested blockquote:
>
> > This is nested one level deeper.
> >
> > > This is nested two levels deeper.

> Blockquote with formatting:
>
> - **Bold list item**
> - `inline code`
> - [A link](https://example.com)

## Custom Containers

::note
Here's some additional information.
::

::tip
Here's a helpful suggestion.
::

::warning
Be careful with this action as it might have unexpected results.
::

::caution
This action cannot be undone.
::

::collapse{title="Collapsed by default"}
This content is hidden until the container is opened.
::

::expand{title="Expanded by default"}
This content is visible by default and can be collapsed.
::

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item A
  - Nested item B
    - Deep nested item
- Third item

* Asterisk item
* Another asterisk item

+ Plus item
+ Another plus item

### Ordered Lists

1. First ordered item
2. Second ordered item
3. Third ordered item

1. Numbering can all be one.
1. Markdown should still render it correctly.
1. Useful for editing.

### Mixed Lists

1. Ordered item
   - Nested unordered item
   - Another nested unordered item
2. Another ordered item
   1. Nested ordered item
   2. Another nested ordered item

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Task with **bold text**
- [ ] Task with `inline code`

## Tables

| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Alpha        | Beta           | 123           |
| Long content that wraps | **Bold** and `code` | 456.78 |
| Link         | [Example](https://example.com) | 999 |

| Feature | Status | Notes |
| --- | --- | --- |
| Paragraphs | Works | Basic text rendering |
| Lists | Works | Nested and task lists |
| Code | Works | Inline and fenced |

## Code Blocks

Inline code: `const answer = 42`.

Indented code:

    const indented = true
    console.log(indented)

Plain fenced code:

```
No language here.
Just plain text.
```

TypeScript:

```ts [test.ts]
console.log("hello")
```

JavaScript with filename:

```js [app.vue]
export default defineComponent({})
```

```ts
type Post = {
  title: string
  tags: string[]
  draft?: boolean
}

const post: Post = {
  title: 'Markdown Syntax Test',
  tags: ['markdown', 'nuxt-content'],
}
```

Code with Line Numbers:

```js {.line-numbers}
function calculateSum(a, b) {
  const result = a + b;
  console.log("Sum:", result);
  return result;
}
```

Line Numbers with Filename:

```ts [line-numbered.ts] {.line-numbers}
const sum = (a: number, b: number) => a + b
```

Line Numbers with Start:

```js [start-demo.js:8] {.line-numbers}
console.log("first visible line")
console.log("second visible line")
```

Vue:

```vue
<script setup lang="ts">
const message = 'Hello Markdown'
</script>

<template>
  <p>{{ message }}</p>
</template>
```

Bash:

```bash
npm run dev
npm run build
```

Diff:

```diff
- const oldTheme = 'light'
+ const newTheme = 'dark'
```

JSON:

```json
{
  "title": "Markdown Syntax Test",
  "draft": true,
  "tags": ["Markdown", "Nuxt Content"]
}
```

Code Group (Nuxt Content MDC):

::code-group
  ```bash [npm]
  npm install
  ```
  ```bash [yarn]
  yarn install
  ```
  ```bash [pnpm]
  pnpm install
  ```
::

## Horizontal Rules

Three hyphens:

---

Three asterisks:

***

Three underscores:

___

## Images

Local image:

![Avatar](/img/avatar.png)

Image with title:

![Background image](/img/background.png "Background")

Linked image:

[![Avatar link](/img/avatar.png)](/img/avatar.png)

### Markdown Image Width Tests

Plain Markdown image:

![Plain avatar](/img/avatar.png)

Markdown image with Nuxt MDC width and height attributes:

![Avatar 96px](/img/avatar.png){width="96" height="96"}

Markdown image with class attributes:

![Avatar with classes](/img/avatar.png){.w-24 .rounded-xl}

Markdown image with Tailwind arbitrary width class:

![Avatar 12rem](/img/avatar.png){.w-[12rem] .rounded-2xl}

Wide Markdown image:

![Wide background](/img/background.png)

Wide Markdown image constrained by class:

![Constrained background](/img/background.png){.max-w-md}

Markdown linked image:

[![Open background](/img/avatar.png)](/img/background.png)

Missing image:

![This image should be missing](/img/not-found-image.png)

Missing image with title:

![Missing image with title](/img/not-found-with-title.png "This image does not exist")

Missing image with explicit size:

![Missing image 320x160](/img/not-found-sized.png){width="320" height="160"}

## Links

Inline link: [Nuxt](https://nuxt.com)

Reference link: [Nuxt Content][nuxt-content]

Another reference link: [Example][example-ref]

[nuxt-content]: https://content.nuxt.com
[example-ref]: https://example.com "Example Title"

## Footnotes

Here is a sentence with a footnote.[^first]

Here is another footnote with more text.[^long-note]

[^first]: This is the first footnote.

[^long-note]: This is a longer footnote.
    It can contain multiple lines when indented.

## HTML

<details>
  <summary>Native details element</summary>

  This content is inside a native HTML details block.
</details>

<kbd>⌘</kbd> + <kbd>K</kbd>

<mark>Highlighted text using HTML mark.</mark>

<span style="color: #53a3f1;">Inline HTML span with custom color.</span>

## Escaping And Entities

HTML entities: &copy; &mdash; &rarr; &lt;div&gt;

Backslash escaping:

\`not code\`

\*\*not bold\*\*

## Definition-Like Text

Term
: Definition syntax may or may not be supported depending on the Markdown parser.

Another Term
: Another definition body.

## Math-Like Text

Inline math-like text: `$E = mc^2$`

Block math-like text:

$$
E = mc^2
$$

This section is here to verify whether math is supported or rendered as plain text.

## Nuxt Content MDC

The following syntax tests Nuxt Content MDC. Rendering depends on available components.

::alert
This is an MDC block using the `Alert` component if it is registered.
::

::alert{type="info"}
This alert passes props.
::

::div{class="rounded-lg border border-[var(--color-border)] p-4"}
This is a raw MDC `div` container with classes.
::

:badge[Inline Badge]{type="info"}

::card
# Card Title

Card content with **Markdown** inside.
::

## Long Content

This section intentionally adds repeated paragraphs so scroll behavior, anchors, and table of contents behavior can be tested.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer luctus, justo vitae aliquet porta, lectus augue blandit nisl, vitae tempor ipsum arcu a erat.

Praesent commodo, magna vitae ullamcorper tristique, ipsum nibh efficitur justo, id volutpat sem ex nec massa.

Curabitur posuere sapien ut ipsum luctus, sed feugiat mi porta. Donec feugiat, magna id dignissim dictum, velit mi rhoncus ipsum, vitae aliquet sapien augue sit amet odio.

## Final Section

If anchor links work correctly, clicking a heading anchor above should not unexpectedly jump here.

End of test document.
