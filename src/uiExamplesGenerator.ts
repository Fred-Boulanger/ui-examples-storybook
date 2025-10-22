/**
 * UI Exemples Generator
 * 
 * This module generates Storybook stories from UI examples YAML files.
 * It processes *.ui_examples.yml files and creates stories that render
 * the specified components with their props and slots.
 */

import { readFileSync } from 'fs'
import { load as parseYaml } from 'js-yaml'
import { join, basename, dirname, extname } from 'path'
import { globSync } from 'glob'
import { logger } from './logger.js'
import { Namespaces, resolveComponentPath } from './namespaces.js'
import { convertToKebabCase } from './utils.js'
import type { Args, ArgTypes } from 'storybook/internal/types'


export interface UIExampleComponent {
  type: 'component'
  component: string
  props?: Record<string, any>
  slots?: Record<string, any>
}

export interface UIExampleImage {
  type: 'image'
  uri: string
  alt?: string
  attributes?: Record<string, any>
}

export interface UIExampleHtmlTag {
  type: 'html_tag'
  tag: string
  value?: string
  attributes?: Record<string, any>
  [key: string]: any // For nested content
}

export interface UIExampleTheme {
  theme: 'image'
  uri: string
  alt?: string
  attributes?: Record<string, any>
}

export interface UIExampleRender {
  type?: 'component' | 'image' | 'html_tag'
  theme?: 'image'
  component?: string
  tag?: string
  value?: string
  props?: Record<string, any>
  slots?: Record<string, any>
  uri?: string
  alt?: string
  attributes?: Record<string, any>
  [key: string]: any // For nested content
}

export interface UIExampleSchema {
  id: string
  enabled: boolean
  label: string
  description?: string
  render: UIExampleRender[]
}

// Helper to read and validate UI Exemple YAML files
const readUIExample = (filePath: string): UIExampleSchema => {
  try {
    const content = readFileSync(filePath, 'utf8')
    const uiExample = parseYaml(content) as UIExampleSchema
    
    if (!uiExample.id || !uiExample.label) {
      throw new Error('UI Exemple must have id and label')
    }
    
    return uiExample
  } catch (error) {
    logger.error(`Error reading UI Exemple file: ${filePath}, ${error}`)
    throw error
  }
}

// Generate import statements for components used in UI Exemples
const generateComponentImports = (
  render: UIExampleRender[],
  namespaces: Namespaces
): string => {
  const imports = new Set<string>()
  
  render.forEach((item) => {
    if (item.type === 'component' && item.component) {
      // Handle both namespace:component and relative path formats
      if (item.component.includes(':')) {
        // Namespace format: namespace:component
        const [namespace, componentName] = item.component.split(':')
        const kebabCaseName = convertToKebabCase(componentName)
        imports.add(`import ${kebabCaseName} from '@${namespace}/${componentName}/${componentName}.component.yml';`)
      } else {
        // Relative path format: ./components/badge/badge.component.yml
        const componentPath = item.component
        const pathParts = componentPath.split('/')
        const componentName = pathParts[pathParts.length - 1].replace('.component.yml', '')
        const kebabCaseName = convertToKebabCase(componentName)
        
        // Convert relative path to namespace alias
        // ./components/badge/badge.component.yml -> @umami/badge/badge.component.yml
        const namespacePath = componentPath.replace('./components/', '@umami/')
        imports.add(`import ${kebabCaseName} from '${namespacePath}';`)
      }
    }
  })
  
  return Array.from(imports).join('\n')
}

// Generate the render function for UI Exemples
const generateRenderFunction = (
  render: UIExampleRender[],
  namespaces: Namespaces
): string => {
  const renderCalls = render.map((item) => {
    if (item.type === 'component' && item.component) {
      let componentName: string
      let kebabCaseName: string

      // Handle both namespace:component and relative path formats
      if (item.component.includes(':')) {
        // Namespace format: namespace:component
        const [namespace, compName] = item.component.split(':')
        componentName = compName
        kebabCaseName = convertToKebabCase(compName)
      } else {
        // Relative path format: ./components/badge/badge.component.yml
        const pathParts = item.component.split('/')
        componentName = pathParts[pathParts.length - 1].replace('.component.yml', '')
        kebabCaseName = convertToKebabCase(componentName)
      }

      const props = item.props ? JSON.stringify(item.props, null, 2) : '{}'
      const slots = item.slots ? JSON.stringify(item.slots, null, 2) : '{}'

      // Use default args to get componentMetadata and merge with custom props/slots
      return `\${${kebabCaseName}.component({ ...${kebabCaseName}.args, ...${props}, ...${slots} })}`
    } else if (item.type === 'image') {
      const attributes = item.attributes ? JSON.stringify(item.attributes, null, 2) : '{}'
      const alt = item.alt || 'Image'
      return `<img src="${item.uri}" alt="${alt}" \${Object.entries(${attributes}).map(([key, value]) => \`\${key}="\${value}"\`).join(' ')} />`
    } else if (item.type === 'html_tag') {
      const attributes = item.attributes ? JSON.stringify(item.attributes, null, 2) : '{}'
      const value = item.value || ''
      const tag = item.tag || 'div'
      
      // Handle nested content (like the 0: array in the YAML)
      let nestedContent = ''
      const nestedKeys = Object.keys(item).filter(key => key !== 'type' && key !== 'tag' && key !== 'value' && key !== 'attributes')
      if (nestedKeys.length > 0) {
        nestedContent = nestedKeys.map(key => {
          const nestedItems = Array.isArray(item[key]) ? item[key] : [item[key]]
          return nestedItems.map(nestedItem => {
            if (nestedItem && typeof nestedItem === 'object' && nestedItem.type === 'html_tag') {
              return generateHtmlTag(nestedItem)
            }
            return nestedItem
          }).join('')
        }).join('')
      }
      
      return `<${tag} \${Object.entries(${attributes}).map(([key, value]) => \`\${key}="\${value}"\`).join(' ')}>${value}${nestedContent}</${tag}>`
    } else if (item.theme === 'image') {
      const attributes = item.attributes ? JSON.stringify(item.attributes, null, 2) : '{}'
      const alt = item.alt || 'Image'
      return `<img src="${item.uri}" alt="${alt}" \${Object.entries(${attributes}).map(([key, value]) => \`\${key}="\${value}"\`).join(' ')} />`
    }
    return ''
  }).filter(Boolean)

  return `() => {
    return \`
      ${renderCalls.join('\n      ')}
    \`
  }`
}

// Helper function to generate HTML tags recursively
const generateHtmlTag = (item: any): string => {
  if (!item || typeof item !== 'object' || item.type !== 'html_tag') {
    return ''
  }
  
  const attributes = item.attributes ? JSON.stringify(item.attributes, null, 2) : '{}'
  const value = item.value || ''
  const tag = item.tag || 'div'
  
  // Handle nested content
  let nestedContent = ''
  const nestedKeys = Object.keys(item).filter(key => key !== 'type' && key !== 'tag' && key !== 'value' && key !== 'attributes')
  if (nestedKeys.length > 0) {
    nestedContent = nestedKeys.map(key => {
      const nestedItems = Array.isArray(item[key]) ? item[key] : [item[key]]
      return nestedItems.map(nestedItem => {
        if (nestedItem && typeof nestedItem === 'object' && nestedItem.type === 'html_tag') {
          return generateHtmlTag(nestedItem)
        }
        return nestedItem
      }).join('')
    }).join('')
  }
  
  return `<${tag} \${Object.entries(${attributes}).map(([key, value]) => \`\${key}="\${value}"\`).join(' ')}>${value}${nestedContent}</${tag}>`
}

// Generate the complete story content for UI Exemples
export const generateUIExampleStory = (
  filePath: string,
  namespaces: Namespaces
): string => {
  try {
    const uiExample = readUIExample(filePath)
    
    if (!uiExample.enabled) {
      logger.info(`UI Exemple ${uiExample.id} is disabled, skipping`)
      return ''
    }
    
    const componentImports = generateComponentImports(uiExample.render, namespaces)
    const renderFunction = generateRenderFunction(uiExample.render, namespaces)
    
    const storyTitle = `UI Examples/${uiExample.label}`
    
    return `
${componentImports}

export default {
  title: '${storyTitle}',
  render: ${renderFunction},
  play: async ({ canvasElement }) => {
    Drupal.attachBehaviors(canvasElement, window.drupalSettings)
  },
}

export const ${uiExample.label} = {}
`
  } catch (error) {
    logger.error(`Error generating UI Exemple story: ${filePath}, ${error}`)
    throw error
  }
}

// Find all UI Exemple files in a directory
export const findUIExampleFiles = (directory: string): string[] => {
  try {
    return globSync(join(directory, '*.ui_examples.yml'))
  } catch (error) {
    logger.error(`Error finding UI Exemple files in ${directory}: ${error}`)
    return []
  }
}
