/**
 * Rehype plugin that transforms conversation patterns into styled chat bubbles.
 *
 * Supports two Markdown patterns:
 * 1. Marker-based: `**You:**` / `**AI:**` paragraphs
 * 2. Blockquote-based: `> **user question**` blockquotes with `---` separators
 *
 * Zero client-side JavaScript — all transformations happen at build time.
 */

export default function rehypeChatBubbles() {
	return (tree) => {
		const { children } = tree;
		if (!children || children.length === 0) return;

		const hasMarkers = children.some((node) => getMarkerRole(node) !== null);
		const hasBlockquotes = children.some(isBlockquoteWithContent);

		if (hasMarkers) {
			processMarkerPattern(tree);
		} else if (hasBlockquotes) {
			processBlockquotePattern(tree);
		}
	};
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively extract all text content from a hast node. */
function extractText(node) {
	if (node.type === 'text') return node.value;
	if (node.children) return node.children.map(extractText).join('');
	return '';
}

/**
 * Check if a node is a marker paragraph like `<p><strong>You:</strong>...</p>`.
 * Returns `'you'`, `'ai'`, or `null`.
 */
function getMarkerRole(node) {
	if (node.type !== 'element' || node.tagName !== 'p') return null;
	const first = node.children?.[0];
	if (first?.type !== 'element' || first.tagName !== 'strong') return null;
	const text = extractText(first).trim();
	if (text === 'You:') return 'you';
	if (text === 'AI:') return 'ai';
	return null;
}

/** Check if a node is a `<blockquote>` with child content. */
function isBlockquoteWithContent(node) {
	if (node.type !== 'element' || node.tagName !== 'blockquote') return false;
	return node.children?.length > 0;
}

/** Check if a node is `<hr>`. */
function isHr(node) {
	return node.type === 'element' && node.tagName === 'hr';
}

/** Detect the footer paragraph `_Shared from Berean Bible Study Web App_`. */
function isFooter(node) {
	if (node.type !== 'element' || node.tagName !== 'p') return false;
	return extractText(node).trim() === 'Shared from Berean Bible Study Web App';
}

/** Build a `<div class="chat-bubble chat-bubble--{role}">` element. */
function createBubble(role, contentChildren) {
	return {
		type: 'element',
		tagName: 'div',
		properties: { className: ['chat-bubble', `chat-bubble--${role}`] },
		children: [
			{
				type: 'element',
				tagName: 'div',
				properties: { className: ['chat-chip', `chat-chip--${role}`] },
				children: [{ type: 'text', value: role === 'you' ? 'You' : 'AI' }],
			},
			...contentChildren,
		],
	};
}

/**
 * Extract remaining children from a marker paragraph after stripping the
 * leading `<strong>You:</strong>` / `<strong>AI:</strong>`.
 */
function getMarkerContent(node) {
	const content = [];
	let foundMarker = false;

	for (const child of node.children) {
		if (!foundMarker) {
			if (
				child.type === 'element' &&
				child.tagName === 'strong' &&
				(extractText(child).trim() === 'You:' || extractText(child).trim() === 'AI:')
			) {
				foundMarker = true;
			}
			continue;
		}

		// Drop leading whitespace-only text nodes right after the marker
		if (content.length === 0 && child.type === 'text' && child.value.trim() === '') {
			continue;
		}

		content.push(child);
	}

	return content;
}

// ---------------------------------------------------------------------------
// Marker-based pattern  (**You:** / **AI:**)
// ---------------------------------------------------------------------------

function processMarkerPattern(tree) {
	const children = tree.children;
	const result = [];
	let i = 0;

	// Preamble — everything before the first marker
	while (i < children.length && getMarkerRole(children[i]) === null) {
		result.push(children[i]);
		i++;
	}

	while (i < children.length) {
		const role = getMarkerRole(children[i]);

		if (role !== null) {
			const extra = getMarkerContent(children[i]);
			const bubbleChildren = [];

			// Re-wrap any inline content that was on the same line as the marker
			if (extra.length > 0) {
				bubbleChildren.push({
					type: 'element',
					tagName: 'p',
					properties: {},
					children: extra,
				});
			}

			i++;

			// Collect siblings until the next marker or the footer boundary
			while (i < children.length) {
				if (getMarkerRole(children[i]) !== null) break;
				if (isHr(children[i]) && i + 1 < children.length && isFooter(children[i + 1])) break;
				if (isFooter(children[i])) break;
				bubbleChildren.push(children[i]);
				i++;
			}

			result.push(createBubble(role, bubbleChildren));
		} else if (isHr(children[i]) && i + 1 < children.length && isFooter(children[i + 1])) {
			result.push(children[i], children[i + 1]);
			i += 2;
		} else {
			result.push(children[i]);
			i++;
		}
	}

	tree.children = result;
}

// ---------------------------------------------------------------------------
// Blockquote-based pattern  (> **question** … --- response …)
// ---------------------------------------------------------------------------

function processBlockquotePattern(tree) {
	const children = tree.children;
	const result = [];
	let i = 0;

	// Preamble — before first blockquote or `<hr>` that precedes one
	while (i < children.length) {
		if (isBlockquoteWithContent(children[i])) break;
		if (isHr(children[i]) && i + 1 < children.length && isBlockquoteWithContent(children[i + 1])) break;
		result.push(children[i]);
		i++;
	}

	while (i < children.length) {
		// Blockquote → You bubble
		if (isBlockquoteWithContent(children[i])) {
			result.push(createBubble('you', children[i].children));
			i++;
			continue;
		}

		if (isHr(children[i])) {
			const next = i + 1 < children.length ? children[i + 1] : null;

			// hr + footer → keep both outside bubbles
			if (next && isFooter(next)) {
				result.push(children[i], children[i + 1]);
				i += 2;
				continue;
			}

			// hr + blockquote → skip the hr; blockquote handled next iteration
			if (next && isBlockquoteWithContent(next)) {
				i++;
				continue;
			}

			// hr + regular content → start an AI bubble
			i++;
			const aiContent = [];
			while (i < children.length) {
				if (isBlockquoteWithContent(children[i])) break;
				if (isHr(children[i])) break;
				if (isFooter(children[i])) break;
				aiContent.push(children[i]);
				i++;
			}
			if (aiContent.length > 0) {
				result.push(createBubble('ai', aiContent));
			}
			continue;
		}

		// Stray footer
		if (isFooter(children[i])) {
			result.push(children[i]);
			i++;
			continue;
		}

		// Fallback: treat orphaned content as an AI bubble
		const aiContent = [];
		while (i < children.length) {
			if (isBlockquoteWithContent(children[i])) break;
			if (isHr(children[i])) break;
			if (isFooter(children[i])) break;
			aiContent.push(children[i]);
			i++;
		}
		if (aiContent.length > 0) {
			result.push(createBubble('ai', aiContent));
		}
	}

	tree.children = result;
}
