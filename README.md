# @fredboulanger/ui-examples-storybook

Generate Storybook stories from UI examples YAML files for Drupal SDC components.

## Features

- **Automatic story generation** from `*.ui_examples.yml` files
- **Component rendering** with props and slots support
- **Image support** for static content
- **Full Storybook integration** with indexer and Vite plugin
- **TypeScript support** with full type definitions
- **Simplified configuration** with minimal setup required
- **Namespace-based component references** using `namespace:component` format
- **Drupal SDC compatibility** with proper component metadata handling

## Installation

```bash
npm install @fredboulanger/ui-examples-storybook
```

## Usage

### 1. Add to your Storybook configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/html-vite'
import { UIExamplesPlugin, uiExamplesIndexer } from '@fredboulanger/ui-examples-storybook'

const config: StorybookConfig = {
  stories: [
    '../components/**/*.component.yml',
    '../stories/*.stories.js',
    '../ui_examples/**/*.ui_examples.yml', // Add UI examples files
  ],
  // ... your existing config
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins || []), UIExamplesPlugin({ namespaces: sdcStorybookOptions.namespaces })],
  }),
  experimental_indexers: (existingIndexers) => [...(existingIndexers || []), uiExamplesIndexer],
}

export default config
```


### 2. Create UI example files

```yaml
# ui_exemples/homepage.ui_examples.yml
id: 'homepage'
enabled: true
label: 'Homepage'
description: 'Homepage example with multiple components'
render:
  - type: component
    component: 'umami:badge'
    props:
      icon: timer
    slots:
      text: 'Welcome!'
  - type: component
    component: 'umami:card'
    props:
      title: 'Featured Content'
  - type: image
    uri: 'https://example.com/image.jpg'
    alt: 'Hero image'
    attributes:
      class: 'hero-image'
```

### 3. Generated stories

The plugin automatically generates stories like:

```javascript
import badge from '@umami/badge/badge.component.yml'
import card from '@umami/card/card.component.yml'

export default {
  title: 'UI Examples/Homepage',
  render: () => {
    return `
      ${badge.component({ ...badge.args, icon: 'timer', text: 'Welcome!' })}
      ${card.component({ ...card.args, title: 'Featured Content' })}
      <img src="https://example.com/image.jpg" alt="Hero image" class="hero-image" />
    `
  },
  play: async ({ canvasElement }) => {
    Drupal.attachBehaviors(canvasElement, window.drupalSettings)
  },
}

export const Homepage = {}
```

## API Reference

### UIExamplesPlugin

Vite plugin for processing UI example files.

```typescript
UIExamplesPlugin(options: {
  namespaces: Record<string, string>
})
```

### uiExamplesIndexer

Storybook indexer for discovering UI example files.

### generateUIExampleStory

Generate a story from a UI example file.

```typescript
generateUIExampleStory(
  filePath: string,
  namespaces: Record<string, string>
): string
```

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import type { UIExampleSchema, UIExampleRender, UIExampleComponent, UIExampleImage } from '@fredboulanger/ui-examples-storybook'

// UI Example schema
interface UIExampleSchema {
  id: string
  enabled: boolean
  label: string
  description?: string
  render: UIExampleRender[]
}

// Render item types
type UIExampleRender = UIExampleComponent | UIExampleImage

interface UIExampleComponent {
  type: 'component'
  component: string // Format: 'namespace:component' or relative path
  props?: Record<string, any>
  slots?: Record<string, any>
}

interface UIExampleImage {
  type: 'image'
  uri: string
  alt?: string
  attributes?: Record<string, any>
}
```

## Configuration

### Namespaces

Configure component namespaces for proper imports:

```typescript
const namespaces = {
  umami: '/path/to/umami/components',
  parent: '/path/to/parent/components',
  assets: '/path/to/assets'
}
```


## License

MIT

## Author

fredboulanger
