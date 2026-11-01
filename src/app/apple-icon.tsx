import { appleTouchIcon } from "@/components/seo/app-icons";
import { brandMarkImageResponse } from "@/components/seo/brand-mark-image";

export const size = { width: appleTouchIcon.size, height: appleTouchIcon.size };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandMarkImageResponse(appleTouchIcon.size, appleTouchIcon.mark);
}
