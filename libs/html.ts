export type Node = Element | string

interface Element {
  type: 'element';
  elName: string;
  attr: Attr;
  children: Node[];
  selfClosing?: true;
}

type Attr = {
  type: 'attr';
  kvs: Record<string, string>;
}

type ElArgs = [Attr, ...Node[]] | Node[]

/**
 * Construct HTML attributes.
 */
export const attr = (kvs: Record<string, string>): Attr =>
  ({ type: 'attr', kvs })

export const a = (...args: ElArgs): Element => createEl('a', args)
export const article = (...args: ElArgs): Element => createEl('article', args)
export const body = (...args: ElArgs): Element => createEl('body', args)
export const h1 = (...args: ElArgs): Element => createEl('h1', args)
export const h2 = (...args: ElArgs): Element => createEl('h2', args)
export const head = (...args: ElArgs): Element => createEl('head', args)
export const html = (...args: ElArgs): Element => createEl('html', args)
export const li = (...args: ElArgs): Element => createEl('li', args)
export const p = (...args: ElArgs): Element => createEl('p', args)
export const main = (...args: ElArgs): Element => createEl('main', args)
export const meta = (attr: Attr): Element => createEl('meta', [attr], { selfClosing: true } )
export const nav = (...args: ElArgs): Element => createEl('nav', args)
export const title = (...args: ElArgs): Element => createEl('title', args)
export const ul = (...args: ElArgs): Element => createEl('ul', args)

/**
 * Construct an HTML element.
 */
export const createEl = (elName: string, args: ElArgs, opts?: { selfClosing?: true }): Element => {
  const [fst, ...rest] = args
  const [attributes, children] = typeof fst === 'object' && fst.type === 'attr'
    ? [ fst, rest as Node[] ]
    : [ attr({}), args as Node[] ]
  return {
    type: 'element',
    elName,
    attr: attributes,
    children,
    selfClosing: opts?.selfClosing
  }
}

export const render = (nodes: Node[]): string =>
  '<!DOCTYPE html>' + '\n' + nodes.map(renderNode).join('\n')

const renderNode = (node: Node): string => {
  if (typeof node === 'string') {
    return escapeForHtml(node)
  } else {
    const { elName, attr, children, selfClosing } = node
    const kvs = Object.entries(attr.kvs).map(([key, val]) => `${key}="${val}"`)
    const attributes = kvs.length > 0 ? (' ' + kvs.join(' ')) : ''
    const closingTag = selfClosing ? '' : `</${elName}>`
    return `<${elName}${attributes}>${children.map(renderNode).join('')}${closingTag}`
  }
}

const escapeForHtml = (str: string) =>
  str.replace(/[&<>]/g, tag => htmlChars[tag] || tag)

const htmlChars: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}
