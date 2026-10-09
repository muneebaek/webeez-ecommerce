import { redirect } from "next/navigation";

// /help has no page of its own — open the first topic
export default function HelpIndex() {
  redirect("/help/shipping");
}
