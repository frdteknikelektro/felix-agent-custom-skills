/**
 * Markdown to ClickUp comment format conversion.
 * Uses remark if available, falls back to plain text.
 */

let unified, remarkParse;
try {
  unified = (await import('unified')).unified;
  remarkParse = (await import('remark-parse')).default;
} catch {
  // Dependencies not installed — plain text fallback
}

// Convert markdown to ClickUp comment format
export function markdownToClickUp(markdown) {
  if (unified && remarkParse) {
    return markdownViaRemark(markdown);
  }
  // Fallback: send as plain text
  return [{ text: markdown, attributes: {} }];
}

function markdownViaRemark(markdown) {
  const tree = unified().use(remarkParse).parse(markdown);
  const comment = [];

  processNode(tree, comment, {});

  // Clean up trailing newlines
  while (
    comment.length > 0 &&
    comment[comment.length - 1].text === '\n' &&
    !comment[comment.length - 1].attributes?.list
  ) {
    comment.pop();
  }

  return comment;
}

// Process AST node recursively
function processNode(node, comment, context) {
  switch (node.type) {
    case 'root':
      node.children.forEach((child) => processNode(child, comment, context));
      break;

    case 'paragraph':
      node.children.forEach((child) => processNode(child, comment, context));
      comment.push({ text: '\n', attributes: {} });
      break;

    case 'heading':
      comment.push({ text: '\n', attributes: {} });
      node.children.forEach((child) =>
        processNode(child, comment, { ...context, bold: true })
      );
      comment.push({ text: '\n', attributes: {} });
      break;

    case 'list':
      const newIndent = (context.indent ?? -1) + 1;
      node.children.forEach((child, index) =>
        processNode(child, comment, {
          ...context,
          listType: node.ordered ? 'ordered' : 'bullet',
          listIndex: index,
          indent: newIndent,
        })
      );
      break;

    case 'listItem': {
      const listAttrs = { list: { list: context.listType } };
      if (context.indent > 0) {
        listAttrs.indent = context.indent;
      }

      let hasNestedList = false;
      node.children.forEach((child) => {
        if (child.type === 'paragraph') {
          child.children.forEach((c) => processNode(c, comment, context));
        } else if (child.type === 'list') {
          comment.push({ text: '\n', attributes: listAttrs });
          processNode(child, comment, context);
          hasNestedList = true;
        } else {
          processNode(child, comment, context);
        }
      });
      if (!hasNestedList) {
        comment.push({ text: '\n', attributes: listAttrs });
      }
      break;
    }

    case 'text':
      const attrs = {};
      if (context.bold) attrs.bold = true;
      if (context.italic) attrs.italic = true;
      if (context.code) attrs.code = true;
      if (context.link) attrs.link = context.link;
      comment.push({ text: node.value, attributes: attrs });
      break;

    case 'strong':
      node.children.forEach((child) =>
        processNode(child, comment, { ...context, bold: true })
      );
      break;

    case 'emphasis':
      node.children.forEach((child) =>
        processNode(child, comment, { ...context, italic: true })
      );
      break;

    case 'inlineCode':
      comment.push({ text: node.value, attributes: { code: true } });
      break;

    case 'code':
      comment.push({ text: node.value, attributes: { 'code-block': true } });
      comment.push({ text: '\n', attributes: {} });
      break;

    case 'link':
      node.children.forEach((child) =>
        processNode(child, comment, { ...context, link: node.url })
      );
      break;

    case 'break':
      comment.push({ text: '\n', attributes: {} });
      break;

    case 'thematicBreak':
      comment.push({ text: '---', attributes: {} });
      comment.push({ text: '\n', attributes: {} });
      break;

    default:
      if (node.children) {
        node.children.forEach((child) => processNode(child, comment, context));
      } else if (node.value) {
        comment.push({ text: node.value, attributes: {} });
      }
  }
}

/**
 * Convert ClickUp comment format back to Markdown
 */
export function clickUpToMarkdown(commentArray) {
  if (!commentArray) return '';
  if (typeof commentArray === 'string') return commentArray;
  if (!Array.isArray(commentArray)) return '';

  let result = '';
  let listCounters = {};
  let pendingListPrefix = null;

  for (let i = 0; i < commentArray.length; i++) {
    const item = commentArray[i];
    const text = item.text || '';
    const attrs = item.attributes || {};

    if (attrs['code-block']) {
      result += '```\n' + text + '\n```';
      pendingListPrefix = null;
      continue;
    }

    if (text === '\n' && attrs.list) {
      const listType = attrs.list.list;
      const indent = attrs.indent || 0;
      const indentStr = '  '.repeat(indent);

      if (!listCounters[indent]) {
        listCounters[indent] = 0;
      }
      listCounters[indent]++;

      Object.keys(listCounters).forEach(key => {
        if (parseInt(key) > indent) {
          delete listCounters[key];
        }
      });

      if (listType === 'ordered') {
        pendingListPrefix = `\n${indentStr}${listCounters[indent]}. `;
      } else {
        pendingListPrefix = `\n${indentStr}- `;
      }
      continue;
    }

    if (text === '\n') {
      listCounters = {};
      pendingListPrefix = null;
      result += '\n';
      continue;
    }

    let formatted = text;

    if (attrs.code) {
      formatted = '`' + formatted + '`';
    }
    if (attrs.bold && attrs.italic) {
      formatted = '***' + formatted + '***';
    } else if (attrs.bold) {
      formatted = '**' + formatted + '**';
    } else if (attrs.italic) {
      formatted = '*' + formatted + '*';
    }
    if (attrs.link) {
      formatted = '[' + formatted + '](' + attrs.link + ')';
    }

    let isFirstListItem = false;
    if (pendingListPrefix === null) {
      for (let j = i + 1; j < commentArray.length; j++) {
        const ahead = commentArray[j];
        if (ahead.text === '\n') {
          if (ahead.attributes?.list) {
            if (result === '' || result.endsWith('\n')) {
              const indent = ahead.attributes.indent || 0;
              const indentStr = '  '.repeat(indent);
              const listType = ahead.attributes.list.list;

              if (!listCounters[indent]) {
                listCounters[indent] = 0;
              }
              listCounters[indent]++;

              if (listType === 'ordered') {
                result += `${indentStr}${listCounters[indent]}. `;
              } else {
                result += `${indentStr}- `;
              }
              isFirstListItem = true;
            }
          }
          break;
        }
      }
    }

    if (pendingListPrefix !== null && !isFirstListItem) {
      result += pendingListPrefix;
      pendingListPrefix = null;
    }

    result += formatted;
  }

  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

// Keep parseInlineFormatting for backwards compatibility
export function parseInlineFormatting(text) {
  const result = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch =
      remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)/s) ||
      remaining.match(/^(.*?)__([^_]+)__(.*)/s);
    if (boldMatch) {
      if (boldMatch[1]) {
        result.push(...parseInlineFormatting(boldMatch[1]));
      }
      result.push({ text: boldMatch[2], attributes: { bold: true } });
      remaining = boldMatch[3];
      continue;
    }

    const italicMatch =
      remaining.match(/^(.*?)\*([^*]+)\*(.*)/s) ||
      remaining.match(/^(.*?)_([^_]+)_(.*)/s);
    if (italicMatch && !italicMatch[1].endsWith('*')) {
      if (italicMatch[1]) {
        result.push(...parseInlineFormatting(italicMatch[1]));
      }
      result.push({ text: italicMatch[2], attributes: { italic: true } });
      remaining = italicMatch[3];
      continue;
    }

    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
    if (codeMatch) {
      if (codeMatch[1]) {
        result.push({ text: codeMatch[1], attributes: {} });
      }
      result.push({ text: codeMatch[2], attributes: { code: true } });
      remaining = codeMatch[3];
      continue;
    }

    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/s);
    if (linkMatch) {
      if (linkMatch[1]) {
        result.push({ text: linkMatch[1], attributes: {} });
      }
      result.push({ text: linkMatch[2], attributes: { link: linkMatch[3] } });
      remaining = linkMatch[4];
      continue;
    }

    result.push({ text: remaining, attributes: {} });
    break;
  }

  return result;
}
