import { Box } from "@mui/material";
import { sanitizeHtml } from "../../../shared/lib/sanitizeHtml";

export function SanitizedHtml({ html }: { html: string }) {
  return (
    <Box
      sx={{
        "& pre": { overflow: "auto", p: 1, bgcolor: "action.hover", borderRadius: 1 },
        "& img": { maxWidth: "100%" },
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
