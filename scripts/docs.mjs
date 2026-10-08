const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

function safeLink(value) {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) {
    return false;
  }
  if (value.startsWith('#')) {
    return true;
  }
  if (value.startsWith('/') && !value.startsWith('//')) {
    return true;
  }
  if (/^mailto:[^@?]+@[^@?]+(?:\?[^<>]*)?$/i.test(value)) {
    return true;
  }
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function inline(text) {
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let output = '';
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    output += escapeHtml(text.slice(cursor, match.index));
    if (match[1] !== undefined) {
      output += `<code>${escapeHtml(match[1])}</code>`;
    } else if (match[2] !== undefined) {
      output += `<strong>${inline(match[2])}</strong>`;
    } else if (safeLink(match[4])) {
      output += `<a href="${escapeHtml(match[4])}">${inline(match[3])}</a>`;
    } else {
      output += inline(match[3]);
    }
    cursor = match.index + match[0].length;
  }
  return output + escapeHtml(text.slice(cursor));
}

function listItem(line) {
  return /^(\s*)([-+*]|\d+[.)])\s+(.+)$/.exec(line);
}

function cells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|')
      .map((cell) => cell.trim());
}

function tableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isBlock(items, index) {
  const marker = /^(#{1,6})\s|^\s*```|^:::details(?:\s|$)|^:::\s*$/;
  return marker.test(items[index]) ||
      listItem(items[index]) ||
      (index + 1 < items.length && tableDivider(items[index + 1]));
}

function flowDiagram(code) {
  const caption = /^caption:\s*(.*)$/i.exec(code[0] || '');
  const nodes = (caption ? code.slice(1) : code)
      .filter((value) => value.trim());
  const entries = nodes.map((node) => {
    const separator = node.indexOf('|');
    const label = (separator < 0 ? node : node.slice(0, separator)).trim();
    const detail = separator < 0 ? '' : node.slice(separator + 1).trim();
    return `<li><strong>${escapeHtml(label)}</strong>` +
        `<span>${escapeHtml(detail)}</span></li>`;
  }).join('');
  return '<figure class="doc-flow"><figcaption>' +
      `${escapeHtml(caption?.[1] || 'Process')}</figcaption>` +
      `<ol>${entries}</ol></figure>`;
}

function table(headers, rows) {
  const head = headers.map((cell) =>
      `<th scope="col">${inline(cell)}</th>`).join('');
  const body = rows.map((row) => {
    const values = headers.map((_, index) =>
        `<td>${inline(row[index] || '')}</td>`).join('');
    return `<tr>${values}</tr>`;
  }).join('');
  return '<div class="table-scroll"><table><thead>' +
      `<tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/**
 * Renders the project's Markdown subset without allowing author-supplied HTML.
 *
 * @param {string} text Markdown document with optional flow and details blocks.
 * @return {string} Escaped HTML with stable heading anchors.
 */
export function markdown(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const ids = new Set();
  const headingId = (title) => {
    const base = title.toLowerCase()
        .replace(/[`*]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-') || 'section';
    let candidate = base;
    let suffix = 2;
    while (ids.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    ids.add(candidate);
    return candidate;
  };

  function render(items, inDetails = false) {
    const output = [];
    for (let i = 0; i < items.length;) {
      const line = items[i];
      if (!line.trim()) {
        i++;
        continue;
      }
      const fence = /^\s*```([^`]*)$/.exec(line);
      if (fence) {
        const code = [];
        i++;
        while (i < items.length && !/^\s*```\s*$/.test(items[i])) {
          code.push(items[i++]);
        }
        if (i < items.length) {
          i++;
        }
        if (fence[1].trim() === 'flow') {
          output.push(flowDiagram(code));
        } else {
          output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        }
        continue;
      }
      const details = /^:::details(?:\s+(.*))?$/.exec(line);
      if (details) {
        const body = [];
        let depth = 1;
        let inFence = false;
        i++;
        while (i < items.length) {
          const next = items[i++];
          if ((!inFence && /^\s*```([^`]*)$/.test(next)) ||
              (inFence && /^\s*```\s*$/.test(next))) {
            inFence = !inFence;
          }
          if (!inFence && /^:::details(?:\s|$)/.test(next)) {
            depth++;
          }
          if (!inFence && /^:::\s*$/.test(next)) {
            depth--;
            if (depth === 0) {
              break;
            }
          }
          body.push(next);
        }
        output.push('<details class="doc-details"><summary>' +
            `${inline(details[1] || 'Details')}</summary>` +
            `${render(body, true)}</details>`);
        continue;
      }
      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        const level = inDetails ?
            Math.min(6, heading[1].length + 2) : heading[1].length;
        const className = level === 1 ? ' class="page-title"' : '';
        const id = escapeHtml(headingId(heading[2]));
        output.push(`<h${level} id="${id}"${className}>` +
            `${inline(heading[2])}</h${level}>`);
        i++;
        continue;
      }
      if (i + 1 < items.length && tableDivider(items[i + 1])) {
        const headers = cells(line);
        const rows = [];
        i += 2;
        while (i < items.length && items[i].includes('|') && items[i].trim()) {
          rows.push(cells(items[i++]));
        }
        output.push(table(headers, rows));
        continue;
      }
      const first = listItem(line);
      if (first) {
        const indent = first[1].length;
        const ordered = /^\d/.test(first[2]);
        const tag = ordered ? 'ol' : 'ul';
        const entries = [];
        while (i < items.length) {
          const current = listItem(items[i]);
          if (!current || current[1].length !== indent ||
              /^\d/.test(current[2]) !== ordered) {
            break;
          }
          const body = [current[3]];
          i++;
          while (i < items.length) {
            const next = listItem(items[i]);
            if (next && next[1].length <= indent) {
              break;
            }
            if (!items[i].trim()) {
              if (i + 1 < items.length && /^\s+\S/.test(items[i + 1])) {
                body.push('');
                i++;
                continue;
              }
              break;
            }
            const leadingSpace = items[i].match(/^\s*/)[0].length;
            if (!/^\s+\S/.test(items[i]) || leadingSpace <= indent) {
              break;
            }
            body.push(items[i++].slice(indent + 2));
          }
          entries.push(`<li>${render(body, inDetails)}</li>`);
          const following = listItem(items[i + 1] || '');
          if (!items[i]?.trim() && following?.[1].length === indent) {
            i++;
          }
        }
        const startNumber = Number.parseInt(first[2], 10);
        const start = ordered && startNumber !== 1 ?
            ` start="${startNumber}"` : '';
        output.push(`<${tag}${start}>${entries.join('')}</${tag}>`);
        continue;
      }
      const paragraph = [line];
      i++;
      while (i < items.length && items[i].trim() && !isBlock(items, i)) {
        paragraph.push(items[i++]);
      }
      output.push(`<p>${inline(paragraph.join(' '))}</p>`);
    }
    return output.join('\n');
  }
  return render(lines);
}
