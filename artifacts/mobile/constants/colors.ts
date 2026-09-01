/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1B1D1A',
    tint: '#D97745',

    // Core surfaces
    background: '#F4F0E8',
    foreground: '#1B1D1A',

    // Cards / elevated surfaces
    card: '#FCFAF5',
    cardForeground: '#1B1D1A',

    // Primary action color (buttons, links, active states)
    primary: '#D97745',
    primaryForeground: '#1B1D1A',
    primaryGlow: 'rgba(217, 119, 69, 0.35)',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#8FA58A',
    secondaryForeground: '#1B1D1A',
    secondaryGlow: 'rgba(143, 165, 138, 0.35)',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E9E4DA',
    mutedForeground: '#687067',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E8B45B',
    accentForeground: '#1B1D1A',
    accentGlow: 'rgba(232, 180, 91, 0.4)',

    // XP / Progression colors
    xp: '#E8B45B',
    xpGlow: 'rgba(232, 180, 91, 0.5)',
    streak: '#E7A07B',
    streakGlow: 'rgba(231, 160, 123, 0.5)',

    // Status colors
    success: '#2E8B57',
    successForeground: '#FFFFFF',
    successLight: '#E8F5E9',
    warning: '#D97745',
    warningForeground: '#1B1D1A',
    warningLight: '#FFF3E0',
    error: '#B8493D',
    errorForeground: '#FCFAF5',
    errorLight: '#FDEDEC',

    // Destructive actions (delete, error states)
    destructive: '#B8493D',
    destructiveForeground: '#FCFAF5',

    // Borders and input outlines
    border: '#D8D1C3',
    input: '#D8D1C3',

    sidebar: '#1B1D1A',
    sidebarForeground: '#F4F0E8',
  },
  dark: {
    text: '#F4F0E8',
    tint: '#E7A07B',
    background: '#171A19',
    foreground: '#F4F0E8',
    card: '#202521',
    cardForeground: '#F4F0E8',
    primary: '#E7A07B',
    primaryForeground: '#171A19',
    primaryGlow: 'rgba(231, 160, 123, 0.4)',
    secondary: '#8FA58A',
    secondaryForeground: '#171A19',
    secondaryGlow: 'rgba(143, 165, 138, 0.4)',
    muted: '#2D332D',
    mutedForeground: '#B7BBAF',
    accent: '#E8B45B',
    accentForeground: '#171A19',
    accentGlow: 'rgba(232, 180, 91, 0.5)',
    xp: '#E8B45B',
    xpGlow: 'rgba(232, 180, 91, 0.6)',
    streak: '#E7A07B',
    streakGlow: 'rgba(231, 160, 123, 0.6)',
    success: '#4CAF50',
    successForeground: '#171A19',
    successLight: '#1B3D23',
    warning: '#E7A07B',
    warningForeground: '#171A19',
    warningLight: '#3D2A1F',
    error: '#E26B5E',
    errorForeground: '#F4F0E8',
    errorLight: '#3D1F1C',
    destructive: '#E26B5E',
    destructiveForeground: '#171A19',
    border: '#3B4039',
    input: '#3B4039',
    sidebar: '#101211',
    sidebarForeground: '#F4F0E8',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;