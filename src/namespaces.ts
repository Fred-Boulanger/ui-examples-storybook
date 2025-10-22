/**
 * Simplified namespaces for UI examples package
 */

export interface Namespaces {
  [key: string]: string
}

export const resolveComponentPath = (
  componentPath: string,
  namespaces: Namespaces
): string => {
  const [namespace, componentName] = componentPath.split(':')
  const namespacePath = namespaces[namespace]
  
  if (!namespacePath) {
    throw new Error(`Namespace '${namespace}' not found`)
  }
  
  return `${namespacePath}/components/${componentName}/${componentName}.component.yml`
}

export const getProjectName = (filePath: string): string => {
  // Simple implementation for UI examples
  return 'UI Examples'
}