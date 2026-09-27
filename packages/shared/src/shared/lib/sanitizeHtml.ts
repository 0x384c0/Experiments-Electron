import DOMPurify from "dompurify";

// any feature rendering externally-sourced HTML (user-generated content from
// an API) goes through this first -- never dangerouslySetInnerHTML raw.
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
