# 🎨 Web Color System Studio v3

**Web Color System Studio v3** is an interactive utility for designers, developers, and students to generate **accessible OKLCH-based color systems** directly from a brand logo or seed color.  
Built for educational use and professional prototyping, it bridges color theory, accessibility, and front-end implementation — producing production-ready **CSS tokens**, **light/dark themes**, and **semantic mappings**.

---

## 🚀 Overview

Starting from a single seed color (typically from a logo), the studio automatically:

1. Converts that color into **perceptual OKLCH space** for accurate lightness control.  
2. Generates **brand and neutral ramps** (e.g., `--brand-50` → `--brand-900`).  
3. Maps those ramps into **semantic design tokens** (`--preview-color-bg`, `--preview-color-brand`, etc.).  
4. Provides an **interactive live preview** with UI components (buttons, cards, tabs, sliders, badges, accordion).  
5. Exports the entire color system as **`tokens.css`** or **JSON**, ready for use in any web project or design system.

---

## 🧠 Why OKLCH?

Unlike HSL or RGB, **OKLCH** is a perceptually uniform color space. Equal numeric changes correspond to visually equal changes in brightness, saturation, and hue — resulting in **smooth ramps**, **consistent contrast**, and **WCAG-friendly color systems**.

> OKLCH values make it easier to design predictable, scalable systems for both light and dark themes.

---

## 🧩 Project Structure

```
web-color-system-studio-v3/
├── index.html          # Main UI with Live Preview
├── style.css           # Layout, typography, and component styling (pure CSS)
├── app.js              # Ramp builder, OKLCH logic, and preview mapper
├── tokens.css          # Prebuilt ramps + semantic mapping (seed #7B458F)
└── README.md           # This document
```

---

## ⚙️ Usage

### Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/<yourusername>/web-color-system-studio-v3.git
   cd web-color-system-studio-v3
   ```
2. Open `index.html` in your browser.

No build tools required — this project runs entirely client-side.

### Generate a New Palette
1. Enter your **seed color** (e.g., `#7B458F`) in the input field.
2. (Optional) Override **brand hue** and **brand chroma** if desired.
3. Adjust the **lightness arrays** for brand and neutral ramps (50→900 scale for brand; 25→950 for neutral).
4. Click **Generate Ramps**.
5. Copy the **CSS variables** or download the **JSON**.

---

## 🎨 Tokens Overview

### 1) Primitive Tokens (OKLCH-derived ramps)
```css
--brand-50:  #F9F3FB;
--brand-500: #7B458F;
--brand-900: #2E123F;

--gray-25:   #FCFCFD;
--gray-950:  #101010;
```

### 2) Semantic Tokens (light/dark themes)
```css
--preview-color-bg: var(--gray-25);
--preview-color-text: var(--gray-900);
--preview-color-brand: var(--brand-600);
--preview-text-on-brand: #fff;
```
> The semantic tokens are defined for both light and dark modes in `tokens.css` and power the Live Preview components.

---

## 🧰 Features

- ✅ OKLCH-based ramp generation  
- ✅ Adjustable lightness arrays (brand + neutral)  
- ✅ Live color preview and theme toggle  
- ✅ Accessible contrast-first mapping  
- ✅ UI components: buttons, cards, tabs, sliders, badges, accordion  
- ✅ JSON and CSS export  
- ✅ WCAG-aware, framework-free (pure CSS)  

---

## 🧭 Vision & Roadmap

### 🎯 Guiding Principle
> *“A color system should be explainable, accessible, and self-contained.”*

The studio will remain a **pure-CSS, standards-compliant token generator** that helps build brand-aligned, WCAG-compliant color systems — without frameworks, preprocessors, or build tools.

### 🌈 Roadmap
**1. Multi-Primary & Accent Support**  
- Multiple brand primaries (e.g., `brandA`, `brandB`, `brandC`)  
- Distinct **accent** ramp (`--accent-50` → `--accent-900`) for highlights  
- Linked contrast pairs so accent & primaries adapt in both themes

**2. Extended Neutral System**  
- Cool, warm, and true gray modes with hue sliders and OKLCH feedback

**3. Pure-CSS Architecture**  
- Continue **no-framework** policy (no Tailwind, Bootstrap, etc.)  
- Progressive enhancement with semantic HTML + CSS

**4. Accessibility by Design**  
- Live contrast checkers and WCAG AA/AAA badges  
- Optional grayscale / color-blind simulation modes

**5. Enhanced Output**  
- `tokens.json`, optional `@layer`-segmented CSS (`tokens.css`, `theme-light.css`, `theme-dark.css`)

**6. Learning Integration**  
- Guided “Learn Mode” with side explanations and instructor/student views

---

## 🌐 GitHub Pages Deployment

You can host this tool **directly on GitHub Pages**:
1. Push this folder as a repository: `web-color-system-studio-v3`  
2. In **Settings → Pages**, set: **Source: `main` → `/ (root)`**  
3. Visit: `https://<yourusername>.github.io/web-color-system-studio-v3/`

---

## 📄 License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

## 👤 Attribution

Created by **Davis Boudreau**.  
Documentation and refactoring support by **ChatGPT (OpenAI GPT-5)**.

---

## 📦 Version

**Web Color System Studio v3**  
_Last updated: November 01, 2025_
