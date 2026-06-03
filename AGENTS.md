<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Code Formatting & Style
- Code comments MUST ALWAYS be written in English.
# Base UI / Shadcn
- For shadcn/ui components using `@base-ui/react`, NEVER use `asChild`. Base UI uses the `render` prop for element composition.
- When passing a non-button element to a trigger component via `render={<div />}` or similar, MUST add `nativeButton={false}` to avoid hydration warnings and accessibility errors.
<!-- END:nextjs-agent-rules -->
