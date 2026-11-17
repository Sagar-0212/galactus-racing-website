How-To-Build-3D-Websites
How to Build a 3D Website

A working guide, from brief to launch


Three things decide whether a 3D website works: whether it should exist at all, what you reference while building it, and the quality of the model you build it with. The rest of this guide is those three ideas, expanded into something you can actually follow.

Part 1 — Decide Whether It Should Be 3D At All
Not every website should be 3D. This is the first filter, and skipping it is the most expensive mistake in the whole process, because you only discover it after the build.

Start with the business goal, not the visual
Before you open any tool, answer these in one sentence each:

What is this site for? A sale, a signup, a demo booking, a funding round, a hire.
Who is arriving, and on what? A CTO on a laptop behaves nothing like a shopper on a three-year-old Android.
What must they understand within eight seconds of landing?
What is the single action you want them to take?
If 3D does not measurably help with points 3 and 4, it is decoration, and decoration has a cost: load time, battery, complexity, and bugs.

When 3D genuinely earns its place
The product is physical and people need to see it from every angle.
The product is abstract (data, infrastructure, AI) and a spatial metaphor explains it faster than a paragraph.
The audience expects craft — design, gaming, creative tooling, luxury — and the site itself is the proof.
You are competing on differentiation rather than price, and being memorable is the goal.
When it does not
Content-heavy sites where people came to read.
Anything where conversion speed is the metric. Every 100ms of load costs you.
Audiences on low-end devices or poor connections.
Accessibility-critical or regulated contexts, unless you are ready to build a genuine reduced-motion alternative.
Tight budgets. 3D is not a skin you apply at the end; it changes the whole build.
The honest test

Describe the site to someone without mentioning how it looks. If the 3D does not come up because it is doing a job, it is not doing a job.

Pick your level of 3D
It is not all or nothing. Most successful sites sit in the middle.

Level

What it means

Cost / risk

Accent

One 3D object or hero element, rest is flat.

Low. Best default for most commercial sites.

Scroll-driven scene

A single scene that transforms as the user scrolls.

Medium. High impact for explaining a process.

Immersive

Navigable 3D space, physics, sustained interaction.

High. Long build, real performance work, needs a fallback.


Part 2 — Gather Tools and References Before You Build
Creativity here is mostly a sourcing problem. You are not inventing a new visual language from nothing; you are combining references deliberately. Do this properly and the build gets dramatically faster, because you stop guessing.

Build a reference board first
Half a day, no code. Collect:

Three to five sites whose motion feels right. Not their content, their timing.
Two or three typography references. Type carries more of the personality than the 3D does.
A colour direction, ideally pulled from something the client already owns.
Specific effects you want, saved as short screen recordings rather than descriptions.
Record the references at low frame rate and scrub through them. You will see the easing, the stagger, and the hold times that you miss at full speed. Those details are what separate a 3D site that feels expensive from one that feels like a demo.

Where to look
Awwwards and Godly for benchmark work. Refero and Mobbin for real product patterns. Codrops for effects that come with source code.
Three.js examples and the React Three Fiber showcase when you need to know whether something is feasible before you promise it.
The stack
Layer

Use

Why

Framework

Next.js or Vite + React

Routing, build tooling, easy static export.

3D

React Three Fiber + Drei

Three.js as components. Much easier to maintain than raw Three.js.

Motion

GSAP + ScrollTrigger

The standard for tying animation to scroll position.

Smooth scroll

Lenis

Feeds ScrollTrigger. Wire it into the GSAP ticker or the two fight each other.

Modelling

Blender, or Spline if you don't model

Spline exports straight to web and is far faster to learn.

Assets

glTF / GLB, Draco or Meshopt compressed

The only sensible web 3D format. Compress everything.

MCP connectors worth wiring up
These let Claude touch your actual project rather than producing code in a vacuum, which is the single biggest quality difference:

Filesystem — so it reads and writes the real files.
Chrome DevTools and Playwright — so it can look at the running page, screenshot it and measure frame time, instead of guessing whether the animation worked.
Blender MCP — model generation and export, if you need custom geometry.
Figma MCP — pulls real design tokens so the build matches the design.
Context7 — current Three.js and GSAP docs, whose APIs change faster than any model's training data.
This is the difference that matters

A model that can screenshot its own work and measure the result will fix its own mistakes. One that cannot will confidently hand you something broken. Wire up the browser tools before you start.


Part 3 — Use a High-End Model, and Drive It Properly
Model quality shows up more in 3D work than almost anywhere else, because the work is cumulative: geometry, timing, performance and taste all have to hold together at once. A weaker model produces code that runs but feels wrong, and you cannot always tell why.

How to brief it
Give it the references as files, not descriptions. Screenshots and recordings, in the prompt.
State the constraints up front: target devices, load budget, brand colours, the one action the page must drive.
Ask for one section at a time. A whole 3D site in one prompt gets you a whole site of mediocre sections.
Make it verify. Tell it to screenshot the result and compare against the reference before reporting back.
Iterate on specifics. 'Make it better' gets you nothing; 'the cards overlap at the bottom of the arc, and the easing is too fast on exit' gets you a fix.
What to check on every section
Does it hold 60fps on a mid-range laptop, not just yours?
Does it degrade sensibly with prefers-reduced-motion?
Does it work at 390px wide, and does the page never scroll sideways?
Do elements overlap at any scroll position, not just the ones you happened to screenshot?
Is text still selectable, readable and in the HTML rather than baked into a canvas?
Performance, the part that sinks projects
Problem

Fix

Huge model files

Draco or Meshopt compression. Aim well under 2MB total for 3D assets.

Too many draw calls

Merge geometry, instance repeated objects.

Oversized textures

1024px or 2048px is usually plenty. Use WebP or KTX2.

Scene runs off-screen

Pause rendering when the canvas is out of viewport. Free performance.

Layout thrash

Never read getBoundingClientRect every frame. Cache measurements, animate transforms only.

Heavy first load

Lazy-load the 3D. Show something meaningful immediately.

Accessibility and the fallback
A 3D site that ignores this is not finished. Keep headings as real HTML so screen readers and search engines can read them. Honour prefers-reduced-motion with a static final state rather than nothing. Make sure every interactive element is reachable by keyboard. None of this is expensive if you plan for it; all of it is expensive to retrofit.

Launch Checklist
60fps on a mid-range device, verified, not assumed.
Total 3D payload compressed and measured.
Reduced-motion path tested.
Mobile tested on a real phone, not just a resized window.
No horizontal scroll at any breakpoint.
No overlapping elements at any scroll position.
Font licences bought. Trial and demo files are not for production.
Icon licences cleared, including any required credit links.
3D model licences cleared for commercial use.
Forms actually deliver somewhere, tested end to end.
Meta tags, favicon, sitemap, robots.txt in place.
Every claim and figure signed off by the client.

The short version: decide honestly whether it should be 3D, gather your references before you write a line of code, and give a capable model the tools to check its own work. Most of the quality comes from those three decisions, not from the code itself.