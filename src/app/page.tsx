import { redirect } from "next/navigation";

/** Fallback when middleware is not active (e.g. static export preview). */
export default function RootPage() {
  redirect("/ru");
}
