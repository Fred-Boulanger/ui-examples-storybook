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

```javascript
// .storybook/main.js
import { UIExamplesPlugin, uiExamplesIndexer } from '@fredboulanger/ui-examples-storybook'

const config = {
  stories: [
    '../components/**/*.component.yml',
    '../stories/*.stories.js',
    '../ui_examples/**/*.ui_examples.yml', // Add UI examples files
  ],
  // ... your existing config
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins || []), UIExamplesPlugin()],
  }),
  experimental_indexers: (existingIndexers) => [...(existingIndexers || []), uiExamplesIndexer],
}

export default config
```


### 2. Create UI example files

```yaml
# ui_examples/homepage.ui_examples.yml
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
import badge from '../components/badge/badge.component.yml'
import card from '../components/card/card.component.yml'

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

```javascript
UIExamplesPlugin(options?: {
  namespaces?: Record<string, string>
})
```

### uiExamplesIndexer

Storybook indexer for discovering UI example files.

### generateUIExampleStory

Generate a story from a UI example file.

```javascript
generateUIExampleStory(
  filePath: string,
  namespaces?: Record<string, string>
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

Configure component namespaces for proper imports (optional):

```javascript
const namespaces = {
  umami: '/path/to/umami/components',
  parent: '/path/to/parent/components',
  assets: '/path/to/assets'
}

// Use in plugin configuration
UIExamplesPlugin({ namespaces })
```

### Component Paths

The plugin automatically resolves component paths based on the project structure:

- **Namespace format**: `umami:badge` → `../components/badge/badge.component.yml`
- **Relative paths**: `./components/card/card.component.yml` → `../components/card/card.component.yml`

This ensures compatibility with Drupal SDC component structures.

## Recent Updates

### v0.1.3 - Enhanced Integration

- **Simplified Configuration**: Plugin now works with minimal configuration
- **Automatic Path Resolution**: Components are automatically resolved from the project structure
- **JavaScript Support**: Full support for `.js` configuration files (main.js)
- **Improved Compatibility**: Better integration with existing Storybook setups
- **Enhanced Error Handling**: More robust error handling and logging

### Key Changes

1. **Plugin Configuration**: The plugin now works without requiring explicit namespace configuration
2. **Path Resolution**: Automatic resolution of component paths based on project structure
3. **Import Generation**: Improved import statement generation for better compatibility
4. **Build Process**: Enhanced build process with better TypeScript and JavaScript support

## License

MIT

## Author

fredboulanger
