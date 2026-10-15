# Changelog

All notable changes to this app are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are pre-1.0 while the MVP is being built; every merged pull request adds an entry under "Unreleased" or a new version.

## [Unreleased]

### Added
- Implementation status overview and feature ideas backlog in `plan.md`
- This changelog

## [0.3.0] - 2026-10-15

Milestone 2: NPC generator ([#3](https://github.com/natascha-baum/acfs-dndPA/pull/3)).

### Added
- NPC generator with an input form: role (enemy / random encounter), gender, race, class and level, each optional ("Random")
- Rule-based generation from D&D 5e API data: standard array assigned by class priority, racial and trait ability bonuses, ability score improvements, hit points, armor class, skills, saving throws, starting equipment and spells
- Own tables for names, appearance, personality and role-based story hooks
- Re-roll the whole NPC or single fields (name, appearance, personality, hook)
- Save generated NPCs to "My Characters" (browser storage)
- Tests against real SRD records from 5e-bits/5e-database

## [0.2.0] - 2026-10-15

Dark fantasy design ([#2](https://github.com/natascha-baum/acfs-dndPA/pull/2)).

### Added
- "Tavern at night" theme: dark palette with gold accents, self-hosted Cinzel and Crimson Pro fonts
- Line icons per module and gilded module cards on the home page
- Home page hero with rising embers and a clickable d20, tavern wisdom scroll
- Themed placeholder pages for upcoming modules

## [0.1.0] - 2026-10-15

Milestone 1: project setup ([#1](https://github.com/natascha-baum/acfs-dndPA/pull/1)).

### Added
- App plan (`plan.md`)
- Vite + React + TypeScript app shell with routing, layout and navigation
- Module registry: each feature is a module that appears in the navigation and on the home page
- Placeholder pages for NPC generator, scene generator, My Characters and character sheet
- Swappable storage layer (browser localStorage for now)
- D&D 5e API client with local caching
- CI workflow (lint, tests, build) and automatic deployment to GitHub Pages
- SRD 5.1 / CC-BY-4.0 attribution in the footer

[Unreleased]: https://github.com/natascha-baum/acfs-dndPA/compare/e575561...HEAD
[0.3.0]: https://github.com/natascha-baum/acfs-dndPA/compare/1477237...e575561
[0.2.0]: https://github.com/natascha-baum/acfs-dndPA/compare/453a438...1477237
[0.1.0]: https://github.com/natascha-baum/acfs-dndPA/compare/1b0a76f...453a438
