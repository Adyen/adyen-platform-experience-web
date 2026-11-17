import { describe, expect, test } from 'vitest';
import { markdownToHtml } from './markdown';

describe('markdownToHtml', () => {
    test('renders basic formatting', () => {
        const html = markdownToHtml('**bold** and *italic* with `code`\n\n- one\n- two');

        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('<em>italic</em>');
        expect(html).toContain('<code>code</code>');
        expect(html).toContain('<li>two</li>');
    });

    test('renders tables', () => {
        const html = markdownToHtml('| Date | Amount |\n| --- | --- |\n| 2026-11-06 | 12.34 EUR |');

        expect(html).toContain('<table>');
        expect(html).toContain('<th>Amount</th>');
        expect(html).toContain('<td>12.34 EUR</td>');
    });

    test('renders line breaks and fenced code', () => {
        expect(markdownToHtml('a\nb')).toContain('<br>');
        expect(markdownToHtml('```\nconst a = 1;\n```')).toContain('<pre><code>const a = 1;\n</code></pre>');
    });

    test('escapes raw HTML', () => {
        const html = markdownToHtml('<script>alert(1)</script> <img src=x onerror=alert(1)>');

        expect(html).not.toContain('<script');
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;script&gt;');
    });

    test('does not render images', () => {
        const html = markdownToHtml('![secret](https://evil.test/?q=data)');

        expect(html).not.toContain('<img');
    });

    test('opens allowed links in a new tab without opener access', () => {
        const html = markdownToHtml('[docs](https://example.test/docs) and https://example.test and [mail](mailto:a@example.test)');

        expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
    });

    test.each(['javascript:alert(1)', 'JaVaScript:alert(1)', 'data:text/html;base64,AAAA', 'vbscript:x', 'ftp://example.test', '//example.test'])(
        'does not link %s',
        url => {
            expect(markdownToHtml(`[click](${url})`)).not.toContain('<a ');
        }
    );
});
