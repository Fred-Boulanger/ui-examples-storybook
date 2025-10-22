/**
 * @fredboulanger/storybook-ui-examples
 * 
 * Generate Storybook stories from UI examples YAML files
 */

export { generateUIExampleStory, findUIExampleFiles } from './uiExamplesGenerator.js'
export { default as UIExamplesPlugin, uiExamplesIndexer } from './vite-plugin-ui-examples.js'

// Main entry point for Storybook integration
export * from './main.js'

// Re-export types
export type {
  UIExampleSchema,
  UIExampleComponent,
  UIExampleImage,
  UIExampleHtmlTag,
  UIExampleTheme,
  UIExampleRender
} from './uiExamplesGenerator.js'
