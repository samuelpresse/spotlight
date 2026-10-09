import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": { bg: "canvas", color: "fg" },
    html: { scrollBehavior: "smooth", scrollbarGutter: "stable" },
    "::selection": { bg: "brand.200", color: "night.950" },
  },
  theme: {
    keyframes: {
      firefly: {
        "0%, 100%": { transform: "translate(0, 0)", opacity: "0.25" },
        "50%": { transform: "translate(8px, -14px)", opacity: "1" },
      },
    },
    tokens: {
      fonts: {
        heading: { value: "var(--font-heading), system-ui, sans-serif" },
        body: { value: "var(--font-body), system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#f6f3f7" },
          100: { value: "#ebe4ee" },
          200: { value: "#d8cbdc" },
          300: { value: "#c2aec8" },
          400: { value: "#a88dae" },
          500: { value: "#8e7196" },
          600: { value: "#75577d" },
          700: { value: "#5e4565" },
          800: { value: "#46334c" },
          900: { value: "#2f2234" },
          950: { value: "#1d1421" },
        },
        silver: {
          50: { value: "#f6f5f8" },
          100: { value: "#e9e7ec" },
          200: { value: "#d4d0da" },
          300: { value: "#b6b0be" },
          400: { value: "#98979c" },
          500: { value: "#7c7b82" },
          600: { value: "#616068" },
          700: { value: "#4c4a55" },
          800: { value: "#36353e" },
          900: { value: "#24232a" },
          950: { value: "#16151a" },
        },
        night: {
          50: { value: "#f4f2f6" },
          100: { value: "#e4dfe6" },
          200: { value: "#c9c1d1" },
          300: { value: "#9f94ad" },
          400: { value: "#73668a" },
          500: { value: "#584b68" },
          600: { value: "#493a5d" },
          700: { value: "#31254a" },
          800: { value: "#251a3d" },
          900: { value: "#1b1230" },
          950: { value: "#120a24" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
          contrast: { value: { _light: "white", _dark: "{colors.night.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.800}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.900}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: "{colors.brand.500}" },
        },
        silver: {
          solid: { value: { _light: "{colors.night.700}", _dark: "{colors.silver.200}" } },
          contrast: { value: { _light: "{colors.silver.50}", _dark: "{colors.night.900}" } },
          fg: { value: { _light: "{colors.silver.700}", _dark: "{colors.silver.300}" } },
          muted: { value: { _light: "{colors.silver.100}", _dark: "{colors.silver.800}" } },
          subtle: { value: { _light: "{colors.silver.50}", _dark: "{colors.silver.900}" } },
          emphasized: { value: { _light: "{colors.silver.200}", _dark: "{colors.silver.700}" } },
          focusRing: { value: "{colors.silver.500}" },
        },
        accentFrom: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.300}" } },
        accentTo: { value: { _light: "{colors.night.400}", _dark: "{colors.silver.200}" } },
        canvas: { value: { _light: "{colors.night.50}", _dark: "{colors.night.950}" } },
        surface: { value: { _light: "#fdfcfd", _dark: "{colors.night.900}" } },
        surfaceBorder: { value: { _light: "{colors.brand.100}", _dark: "{colors.whiteAlpha.100}" } },
        fg: {
          DEFAULT: { value: { _light: "{colors.night.900}", _dark: "{colors.night.50}" } },
          muted: { value: { _light: "{colors.night.500}", _dark: "{colors.night.300}" } },
          subtle: { value: { _light: "{colors.night.400}", _dark: "{colors.night.400}" } },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
