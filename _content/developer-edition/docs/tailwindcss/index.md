---
title: Using Tailwind CSS
desc: Tailwind CSS comes in handy for utilizing and implementing CSS styles quickly and efficiently.
---

Tailwind CSS is a utility-first CSS framework that makes it fast and intuitive to style your pages.
It works by scanning all of your HTML, JavaScript, and template files for class names, generating the corresponding CSS, and writing everything to a single optimized stylesheet.

## ⚡ Why Tailwind CSS

- Fast to build with: You can design directly in your markup — no switching between HTML and CSS files.
- Responsive by default: Utilities like `sm:`, `md:`, and `lg:` make it easy to handle any screen size.
- Consistent design: Shared design tokens ensure your pages look unified across all modules.
- Perfect for HubSpot: Works great inside FreshJuice modules, with no custom CSS needed.

## 🎨 Example

A simple centered call-to-action block:

```html
<section class="text-center py-16 bg-orange-50">
  <h2 class="text-3xl font-semibold text-orange-600 mb-4">
    Stay fresh with FreshJuice 🍊
  </h2>
  <p class="text-gray-600 mb-6">
    Build vibrant HubSpot pages with reusable components.
  </p>
  <a href="/docs/" class="inline-block bg-orange-500">
    Explore Knowledge Base
  </a>
</section>
```

This small snippet uses Tailwind’s spacing, typography, and color utilities — no external CSS required.

## 🧩 Customization

Tailwind v4 introduces a new way to customize your design system — directly inside your main CSS file using the @theme {} declaration.

You can now define your own color palette, spacing, typography, and any other design tokens right in main.css, keeping everything in one place.

FreshJuice ships with a pre-tuned Tailwind setup designed to match the theme’s vibrant look and consistent spacing.
If you’d like to adjust it, simply edit the values in the `@theme {}` block and rebuild your assets.

## 🧠 Learn More

Want to master Tailwind and learn all its tasty tricks?
Visit [tailwindcss.com](https://tailwindcss.com/) — where [Adam](https://adamwathan.me/) and the Tailwind team share fresh patterns, ideas, and recipes for building with style 🍋
