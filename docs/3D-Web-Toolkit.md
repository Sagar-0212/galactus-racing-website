Edit with the Docs app
Make tweaks, leave comments and share with others to edit at the same time.
NO, THANKSUSE THE APP

FORFI-3D-Web-Toolkit
The 3D Web Toolkit

Inspiration, tooling and asset sources for building 3D websites with Claude


Everything below is grouped by what you actually reach for at each stage: what to look at before you start, what to build with, and where the assets come from. Links change; check anything that looks stale before you rely on it.

1. Ten 3D Websites Worth Studying
Don't just admire these. Open DevTools, scrub the scroll slowly, and work out what is actually moving: the camera, the mesh, or the page. That is where the learning is.

Site

What to steal from it

Bruno Simon

bruno-simon.com

The reference point for a playable 3D portfolio. A real physics car on a real ground plane. Study how load time is managed and how little of the scene is on screen at once.

Lusion

lusion.co

Custom shaders and fluid, weighty motion. Best-in-class example of GPU work that still feels calm rather than showy.

Active Theory

activetheory.net

Large-scale WebGL production work. Look at how they stage transitions between scenes without a visible load.

Igloo Inc

igloo.inc

Awwwards Site of the Year calibre. Heavy 3D held together by very disciplined typography.

Zajno

zajno.com

Shader-driven interaction that stays tied to content. Strong at restraint.

Codrops demos

tympanus.net/codrops

Not one site but a library of buildable techniques, most with full source. The fastest way to learn a specific effect.

Three.js Examples

threejs.org/examples

The canonical reference. Every effect you are likely to want has a minimal version here.

React Three Fiber showcase

r3f.docs.pmnd.rs

If you are building in React, start here rather than raw Three.js. The showcase doubles as a pattern library.

Awwwards 3D collection

awwwards.com (filter: 3D / WebGL)

Curated and continuously refreshed. Use it to spot what is current rather than what was impressive in 2021.

Basement Studio

basement.studio

Commercial 3D that still converts. Useful counterweight to pure showcase work.

2. Ten MCP Servers for 3D Web Work
A note on terminology, because it matters for how you set this up: MCP (Model Context Protocol) servers connect Claude to tools and data. GSAP and Three.js are not MCP servers, they are JavaScript libraries that Claude writes code against. Both lists are below, because you need both.

Actual MCP servers
MCP server

Why it matters for 3D work

Blender MCP

The big one. Lets Claude drive Blender directly to create, modify and export models, then hand you a glTF for the web. Closest thing to an AI 3D asset pipeline.

Figma MCP (Dev Mode)

Official. Pulls real design tokens, spacing and component structure out of Figma so the build matches the design instead of approximating it.

Chrome DevTools MCP

Lets Claude inspect the running page: performance traces, console, network. Essential for finding what is dropping frames in a heavy scene.

Playwright MCP

Drives a real browser. Claude can scroll your scene, screenshot it, and check the animation actually looks right rather than assuming.

Context7 MCP

Fetches current library documentation on demand. Genuinely useful for Three.js and GSAP, whose APIs move faster than any model's training data.

Filesystem MCP

Read and write project files directly. Table stakes for any real build.

GitHub MCP

Branches, commits, PRs and issues without leaving the conversation.

Vercel MCP

Deployments, build logs and environment variables. Shortens the change-to-live loop.

Cloudinary MCP

Asset hosting with on-the-fly transforms. Handy for compressing textures and posters for 3D scenes.

Sequential Thinking MCP

Structured multi-step reasoning. Helps on genuinely hard problems like camera rigs and scroll-timeline maths.

Availability and names change quickly in the MCP ecosystem. Check the official directory at modelcontextprotocol.io and the Claude connector settings before assuming one of these is installable today.

The libraries Claude writes against
Library

Role

Three.js

The renderer. Everything else sits on top.

React Three Fiber + Drei

Three.js as React components. Far faster to build and maintain.

GSAP + ScrollTrigger

Timeline and scroll control. The tool for tying motion to scroll position.

Lenis

Smooth scroll. Pair it with ScrollTrigger or the two will fight.

Spline

Browser-based 3D scene editor that exports straight to web. Fastest route for non-modellers.

Theatre.js

Visual animation sequencer for 3D scenes. Good when timing needs to be tuned by eye.

Rapier / Cannon-es

Physics, if objects need to collide or fall.

Postprocessing

Bloom, depth of field, grain. Where a scene gets its finish.

3. Icons, SVG and Logos
Source

Best for

Licence note

Lucide

lucide.dev

Clean open-source line icons. The default choice for UI.

ISC, free commercial

Heroicons

heroicons.com

Made by the Tailwind team, pairs naturally with Tailwind projects.

MIT

Phosphor

phosphoricons.com

Six weights of the same set. Useful when you need range.

MIT

Icons8

icons8.com

Huge library including the 3D Fluency set used for 3D-styled UI.

Free tier REQUIRES a visible credit link

SVG Repo

svgrepo.com

Half a million SVGs, mixed licences.

Check per asset

SVG Logos

svglogos.dev

Clean brand logos in SVG.

Brand marks, check usage rights

Simple Icons

simpleicons.org

Brand icons, single colour, consistent.

CC0, but brand rules still apply

Iconify

iconify.design

Aggregator across 150+ icon sets with one API.

Varies by set

Tabler Icons

tabler.io/icons

5000+ consistent stroke icons.

MIT

unDraw

undraw.co

Recolourable flat illustrations.

Free commercial

4. Design References and Inspiration
Source

What it is good for

Awwwards

awwwards.com

The benchmark for high-end interactive work. Filter by WebGL or 3D.

Godly

godly.website

Tightly curated, low noise. Strong for typography and layout direction.

Refero

refero.design

Real product UI screenshots, searchable by pattern. Best for flows, not decoration.

Land-book

land-book.com

Landing pages at volume. Good for structural ideas.

Mobbin

mobbin.com

Real app and web flows, screen by screen.

Dribbble

dribbble.com

Visual direction. Treat as mood, not spec, much of it is not buildable.

Behance

behance.net

Full case studies rather than single shots. Better context than Dribbble.

Pinterest

pinterest.com

Broad moodboarding. Best used to find a direction, then leave.

SiteInspire

siteinspire.com

Well-tagged, design-led. Strong editorial and agency work.

Codrops

tympanus.net/codrops

Inspiration with the source code attached. The only one on this list you can copy from directly.

Motion.page / motionsites

(motion showcases)

Specifically animation-focused collections. Useful when you need a motion reference, not a layout one.

Cosmos

cosmos.so

Visual search across curated creative work. Good for building a coherent board fast.

5. A Short Word on Licensing
This is the part that bites people at launch, so it is worth being blunt about it.

Fonts are the most common problem. Trial and demo font files are for evaluation only. If a typeface is doing the heavy lifting in your design, buy the licence before the site goes public.
Icons8's free tier requires a visible credit link on the site. Remove the credit and you need a paid licence.
3D models from free marketplaces vary wildly. Check whether commercial use and modification are allowed, per model.
Stock and AI-generated imagery: confirm the commercial terms of whichever generator produced it.
None of this is expensive to get right up front. All of it is expensive to fix after a client has launched.