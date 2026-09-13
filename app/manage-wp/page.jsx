import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function ManageWpRedirect() {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com";
  redirect(`${wpUrl.replace(/\/$/, "")}/wp-login.php`);
}
