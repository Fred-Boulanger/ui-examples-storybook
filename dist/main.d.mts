import { Indexer } from 'storybook/internal/types';

/**
 * Simplified namespaces for UI examples package
 */
interface Namespaces {
    [key: string]: string;
}

/**
 * UI Exemples Generator
 *
 * This module generates Storybook stories from UI examples YAML files.
 * It processes *.ui_examples.yml files and creates stories that render
 * the specified components with their props and slots.
 */

interface UIExampleComponent {
    type: 'component';
    component: string;
    props?: Record<string, any>;
    slots?: Record<string, any>;
}
interface UIExampleImage {
    type: 'image';
    uri: string;
    alt?: string;
    attributes?: Record<string, any>;
}
interface UIExampleHtmlTag {
    type: 'html_tag';
    tag: string;
    value?: string;
    attributes?: Record<string, any>;
    [key: string]: any;
}
interface UIExampleTheme {
    theme: 'image';
    uri: string;
    alt?: string;
    attributes?: Record<string, any>;
}
interface UIExampleRender {
    type?: 'component' | 'image' | 'html_tag';
    theme?: 'image';
    component?: string;
    tag?: string;
    value?: string;
    props?: Record<string, any>;
    slots?: Record<string, any>;
    uri?: string;
    alt?: string;
    attributes?: Record<string, any>;
    [key: string]: any;
}
interface UIExampleSchema {
    id: string;
    enabled: boolean;
    label: string;
    description?: string;
    render: UIExampleRender[];
}
declare const generateUIExampleStory: (filePath: string, namespaces: Namespaces) => string;
declare const findUIExampleFiles: (directory: string) => string[];

/**
 * Vite Plugin for UI Exemples
 *
 * This plugin processes *.ui_examples.yml files and generates Storybook stories.
 * It includes both a Vite plugin for processing files and an indexer for Storybook.
 */

declare const _default: ({ namespaces, }?: {
    namespaces?: Namespaces | undefined;
}) => {
    name: string;
    load(id: string): Promise<string | undefined>;
};

declare const uiExamplesIndexer: Indexer;

export { type UIExampleSchema as U, _default as UIExamplesPlugin, type UIExampleComponent as a, type UIExampleImage as b, type UIExampleHtmlTag as c, type UIExampleTheme as d, type UIExampleRender as e, findUIExampleFiles, generateUIExampleStory, uiExamplesIndexer };
