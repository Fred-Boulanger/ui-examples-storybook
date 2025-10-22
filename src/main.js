/**
 * Main entry point for ui-examples-storybook integration
 * This file provides the necessary exports for Storybook configuration
 */

import { generateUIExampleStory, findUIExampleFiles } from './uiExamplesGenerator.js'
import UIExamplesPlugin, { uiExamplesIndexer } from './vite-plugin-ui-examples.js'

// Export the plugin and indexer for use in Storybook configuration
export { UIExamplesPlugin, uiExamplesIndexer }

// Export utility functions
export { generateUIExampleStory, findUIExampleFiles }
