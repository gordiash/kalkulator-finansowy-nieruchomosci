import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    h1: (props) => <h1 {...props} className="text-3xl font-bold mb-4" />,
    h2: (props) => <h2 {...props} className="text-2xl font-semibold mt-8 mb-4" />,
    h3: (props) => <h3 {...props} className="text-xl font-semibold mt-6 mb-3" />,
    p: (props) => <p {...props} className="leading-relaxed mb-4" />,
    ul: (props) => <ul {...props} className="list-disc pl-6 mb-4" />,
    ol: (props) => <ol {...props} className="list-decimal pl-6 mb-4" />,
    li: (props) => <li {...props} className="mb-2" />,
    a: (props) => <a {...props} className="text-blue-600 hover:underline" />,
    blockquote: (props) => <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic my-4" />,
    hr: (props) => <hr {...props} className="my-8" />,
    ...components,
  };
} 