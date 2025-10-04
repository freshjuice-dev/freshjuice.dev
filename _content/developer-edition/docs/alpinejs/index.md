---
title: Using Alpine.js
desc: Alpine.js is a minimal framework for composing JavaScript behavior in your markup.
---

## Using Alpine.js

[Alpine.js](https://alpinejs.dev/) is a minimal JavaScript framework that lets you add dynamic, reactive behavior directly in your HTML — without the overhead of larger frameworks like Vue or React.
It’s perfect for lightweight interactivity inside HubSpot or static sites built with the **FreshJuice Developer Edition**.

### 🧩 Why Alpine.js

- **Lightweight:** Only a few kilobytes in size, loads instantly.
- **Declarative:** Write logic directly in your markup with `x-` attributes.
- **Reactive:** Changes to data automatically update your DOM.
- **Perfect for HubSpot:** Works great inside custom modules or themes without extra build steps.

### ⚙️ Getting Started

Alpine.js is already included in the **FreshJuice Developer Edition**, so you don’t need to install anything manually.

You can start using it right away by adding attributes to your HTML:

```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle text</button>

  <p x-show="open" class="fade">🍊 Hello from Alpine.js!</p>
</div>
```

Here’s what happens:

- x-data defines a local component state.
- @click toggles the open variable when the button is clicked.
- x-show conditionally displays the paragraph based on that state.

### 🎨 Common Use Cases

You can use Alpine.js to:

- Toggle elements (menus, tabs, modals).
- Animate or transition content visibility.
- Bind dynamic data inside templates.
- Handle form interactions or validation.

Example — a simple FAQ accordion:

```html
<div x-data="{ open: false }" class="faq">
  <button @click="open = !open" class="faq-title">What is FreshJuice?</button>

  <div x-show="open" x-transition class="faq-content">
    A vibrant open-source theme for HubSpot CMS 🍊
  </div>
</div>
```

### 🧠 Learn More

Want to dive deeper and learn all the tasty tricks?
[Visit Alpine.js](https://alpinejs.dev) — where [Caleb](https://calebporzio.com/), the creator himself, shares delightful recipes, patterns, and insights for building with pure flavor 🍋
