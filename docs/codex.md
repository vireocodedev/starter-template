# Working with Codex in the Vireo Template and generated apps

Start Codex from the repository you intend to change. A Template-maintainer session
starts at the Template root; a consumer-app session starts at that application's root.
This lets Codex load the matching `AGENTS.md` and `.agents/skills` guidance.

Use a shared workspace session only for an explicitly scoped change spanning Starter,
Template, or one or more applications. Do not assume that every nested repository is
in scope simply because it is nearby.

The Template's maintainer skill is intentionally not projected. Newly created
applications receive application-owned Codex guidance and app-facing skills instead.
Existing or older applications may not have these files; inspect their manifests,
dependencies, scripts, and generated ownership before applying current conventions.

Trust only repositories whose source and commands you have reviewed. Trusting a
repository enables its project instructions; it does not authorize release,
deployment, secrets, provider settings, or other external changes. Connect optional
plugins only after reviewing their permissions and keeping human approval for any
external mutation.
