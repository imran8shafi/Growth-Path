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

    // Secondary / less-emphasis interactive surfaces
    secondary: '#8FA58A',
    secondaryForeground: '#1B1D1A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E9E4DA',
    mutedForeground: '#687067',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E8B45B',
    accentForeground: '#1B1D1A',

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
    secondary: '#8FA58A',
    secondaryForeground: '#171A19',
    muted: '#2D332D',
    mutedForeground: '#B7BBAF',
    accent: '#E8B45B',
    accentForeground: '#171A19',
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
