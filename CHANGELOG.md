# Changelog

Notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This file was started on 2026-10-31; for anything earlier,
see the [commit history](https://github.com/mrzroot/page-smash/commits).

## [Unreleased]

## [1.0.0] - 2026-10-31

First tagged release. The extension had been usable from a clone for a while, but there was nothing to download, and
Firefox users had to run `scripts/pack.sh` themselves. This release attaches ready-made zips for Chrome/Edge and Firefox.
The game itself is unchanged from the code already on `main`.

### Added
- Release zips: `page-smash-chrome.zip` (Chrome, Edge) and `page-smash-firefox.zip` (Firefox 128+).
- Issue templates, CONTRIBUTING.md and this changelog.

### Changed
- README rewritten: plain-language introduction, controls table, how it works and limits, Persian section in RTL.
- `dist/` is git-ignored so built zips are never committed.
