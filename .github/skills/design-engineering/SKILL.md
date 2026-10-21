---
name: design-engineering
description: 'Design, implement, or critique polished web interfaces. Use for frontend UI work involving visual hierarchy, interaction design, motion, responsive behavior, accessibility, or interface quality reviews.'
---

# Design Engineering

Help turn product intent into clear, distinctive, dependable interfaces. Use this workflow for either **build mode** or **critique mode**. Treat the Emil Kowalski reference as a source of general design-engineering principles, not as a persona or a request to reproduce a recognizable style.

## Workflow

1. **Establish the job.** Identify the audience, primary user task, context of use, and what success looks like. Note constraints such as framework, supported browsers, existing design system, assets, content, and time. Ask only for details that materially change the solution; otherwise state a reasonable assumption and proceed.

2. **Inspect the actual surface.** Read the relevant page, component, styles, scripts, and nearby tests. Identify existing visual and interaction conventions before proposing changes. Reuse the project's patterns and dependencies; do not introduce a parallel design system for a local feature.

3. **Choose a direction for a reason.** Define hierarchy, layout, typography, color, density, and imagery around the product and task. Make each prominent choice explainable by audience, content, or behavior. Avoid interchangeable templates and fashionable decoration that competes with the work. Do not imitate a named designer's signature composition or distinctive details.

4. **Decide behavior before ornament.** Map the primary flow and important states: default, hover, focus, pressed, disabled, loading, empty, success, and error where relevant. Prefer familiar, accessible controls. Preserve clear affordances and keep frequent actions direct.

5. **Use motion selectively.** For each proposed animation, name its job: communicate state, preserve spatial context, clarify cause and effect, or provide occasional delight. Consider how often it repeats and whether it delays or distracts from the task. Omit motion when it adds no user value. Keep functional transitions responsive, use existing animation tools, and honor reduced-motion preferences.

6. **Build the smallest complete slice.** Implement the real interaction, not a static mockup, when the request implies a usable feature. Use semantic HTML, keyboard-accessible controls, visible focus, responsive layout, and the repository's established tokens and component patterns. Include relevant empty, loading, and error states without expanding into unrelated features.

7. **Review in critique mode.** Inspect the implementation and, when available, its rendered state at relevant viewport sizes. Report concrete findings first, ordered by impact. For each finding, connect the observed issue to a user consequence and recommend a specific correction. Separate functional/accessibility defects from visual preferences; do not invent defects to fill a review.

8. **Validate the result.** Run the narrowest relevant tests, type checks, or lint checks. For visual work, verify desktop and mobile layouts in a browser or screenshots when those tools are available. Check that text fits, elements do not overlap, controls work by keyboard and pointer, states are understandable, and motion remains usable with reduced motion enabled. Fix regressions in the touched slice and repeat the focused check.

## Quality Gate

Before calling the work complete, confirm:

- The primary task is obvious and the hierarchy supports it.
- Visual decisions fit the product and existing site rather than looking like a detached template.
- Every interaction has a clear affordance and a coherent response.
- Motion has a stated purpose, does not impede repeated work, and respects reduced-motion settings.
- Layout and content remain usable at narrow and wide viewports, with no clipping or incoherent overlap.
- Relevant keyboard, focus, and semantic accessibility needs are covered.
- Focused validation passed, or any unavailable check and remaining risk is stated plainly.

## Response

For build work, briefly summarize what changed and what was verified. For critique, lead with prioritized findings and include relevant assumptions and test gaps. Keep explanations concrete: describe why a choice improves the user's task, not merely that it looks polished.