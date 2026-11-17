import MarkdownIt from 'markdown-it';

const ALLOWED_LINK_PROTOCOLS = /^(https?:|mailto:)/i;

/**
 * Renders the assistant's markdown to HTML. The model's output is untrusted, so the renderer is locked down:
 * - raw HTML is escaped (`html: false`),
 * - images are not rendered, because loading one lets a prompt-injected reply send conversation data to any server,
 * - links may only use http(s) and mailto, and open in a new tab without giving the target access to the page.
 */
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });

markdown.disable('image');

const isAllowedLink = (url: string) => ALLOWED_LINK_PROTOCOLS.test(url.trim());
const defaultValidateLink = markdown.validateLink.bind(markdown);
markdown.validateLink = url => defaultValidateLink(url) && isAllowedLink(url);

const renderLinkOpen = markdown.renderer.rules.link_open ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
    tokens[index]!.attrSet('target', '_blank');
    tokens[index]!.attrSet('rel', 'noopener noreferrer');
    return renderLinkOpen(tokens, index, options, env, self);
};

export const markdownToHtml = (text: string): string => markdown.render(text);
