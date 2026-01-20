# Changelog

## 2026-01-20 - v1.0.1

Add: Auto-expand folders feature - clicking a pinned folder now navigates to and expands it in the file explorer
Add: "Auto-expand folders" setting to enable/disable folder expansion behavior (enabled by default)
Fix: Folder click functionality - pinned folders now properly reveal and expand in the file explorer
Fix: Pin icon indicator not showing for root-level files and Obsidian Base files  
Fix: TypeScript type safety improvements - removed `any` types, added `FileExplorerView` interface

## 2026-01-16 - v1.0.0

Add: Initial release with pin-to-top functionality for files and folders
Add: Right-click context menu integration for pinning/unpinning items
Add: Command palette commands for keyboard workflows (`Pin current file`, `Unpin current file`, `Toggle pin for current file`)
Add: Settings tab to manage all pinned items with bulk operations
Add: Visual pin icon indicators using SVG for theme compatibility
Add: Automatic cleanup when files are renamed or deleted
Add: Mobile support (works on all platforms)
