# PDF Editor – Project Plan & Theme Document

**Project Name:** PDF Editor  
**Repo Name Suggestion:** `pdf-editor`  
**Developer:** Abuzar Sayyed

---

## 1. Project Overview

A modern, clean, and fast **web-based PDF Editor** that allows users to:

- Upload PDF files
- View PDF pages
- Add text, images, and annotations
- Highlight / underline text
- Delete / rearrange pages
- Merge / split PDFs (basic)
- Download the edited PDF

**Goal:**  
Create a simple yet powerful PDF editing tool with a beautiful UI that feels modern and professional.

---

## 2. Theme & Design Direction

### Overall Vibe
- **Dark Mode First** (with optional light mode later)
- Clean, minimal, and professional
- Soft purple + cyan accents (matching your portfolio style)
- Smooth animations and good spacing
- Mobile-friendly + desktop optimized

### Color Palette

| Role               | Color          | Hex         |
|--------------------|----------------|-------------|
| Background         | Near Black     | `#0a0a0f`   |
| Surface / Cards    | Dark Gray      | `#111827`   |
| Primary Accent     | Soft Purple    | `#8b5cf6`   |
| Secondary Accent   | Cyan           | `#06b6d4`   |
| Text Primary       | White          | `#f8fafc`   |
| Text Muted         | Gray           | `#94a3b8`   |
| Success            | Green          | `#22c55e`   |
| Danger             | Red            | `#ef4444`   |

### Typography
- **Headings:** Inter / Geist (Bold)
- **Body:** Inter (Regular / Medium)

### UI Style
- Rounded corners (soft)
- Subtle borders + glow on hover
- Clean toolbar
- Sidebar for tools (desktop)
- Bottom toolbar for mobile

---

## 3. Core Features (MVP - First Version)

### Must Have (Phase 1)
1. Upload PDF (drag & drop + button)
2. PDF Viewer (page by page)
3. Add Text annotation
4. Highlight text
5. Draw freehand / shapes (basic)
6. Delete pages
7. Reorder pages
8. Download edited PDF

### Nice to Have (Phase 2)
- Add images / signatures
- Merge multiple PDFs
- Split PDF
- Password protect
- Undo / Redo
- Dark / Light mode toggle

---

## 4. Tech Stack (Recommended)

| Layer              | Technology                          | Why?                              |
|--------------------|-------------------------------------|-----------------------------------|
| Framework          | **Next.js 15 (App Router)**         | Fast, modern, good for web apps   |
| Language           | TypeScript                          | Type safety                       |
| Styling            | Tailwind CSS                        | Fast + consistent design          |
| PDF Handling       | `pdf-lib` + `react-pdf`             | Best free libraries for PDF edit  |
| State Management   | Zustand or React Context            | Simple and lightweight            |
| UI Components      | Custom + Lucide Icons               | Clean look                        |
| Animations         | Framer Motion                       | Smooth interactions               |
| Deployment         | Vercel                              | Best for Next.js                  |

---

## 5. Project Structure (Suggested)

```
pdf-editor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main editor page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Toolbar.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AnnotationTools.tsx
│   │   └── UploadArea.tsx
│   ├── lib/
│   │   ├── pdf-utils.ts          # pdf-lib helpers
│   │   └── store.ts              # State management
│   └── types/
│       └── index.ts
├── public/
├── package.json
└── README.md
```

---

## 6. Development Plan (Step by Step)

1. **Setup** → Create Next.js project + install dependencies (`pdf-lib`, `react-pdf`, etc.)
2. **Layout & Theme** → Dark theme, colors, basic structure
3. **Upload System** → Drag & drop + file input
4. **PDF Viewer** → Show pages properly
5. **Annotation Tools** → Text, Highlight, Draw
6. **Page Management** → Delete / Reorder pages
7. **Export** → Download edited PDF
8. **Polish** → Loading states, animations, mobile responsiveness
9. **Deploy** → Vercel pe live

---

## 7. Repo Name Suggestion

**Recommended:** `pdf-editor`

Alternative names:
- `modern-pdf-editor`
- `vibe-pdf-editor`
- `abuzar-pdf-editor`

---

## 8. Next Steps

1. Is document ko padh lo
2. Theme, features, ya tech stack mein koi change chahiye toh batao
3. Approve karne ke baad:
   - Main naya repo `pdf-editor` bana dunga
   - Basic Next.js structure push kar dunga

---

**Document prepared for Abuzar Sayyed**  
**Project:** PDF Editor  
**Theme:** Dark Mode + Purple/Cyan Accents
