import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/features/admin-auth/server/admin-session.service";

export default async function ProtectedAdminLayout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return children;
}
