import AuthenticatedLayout from "./compo/AuthenticatedLayout";

export default function PortalLayout({ children }) {
  // The children here will automatically be your Dashboard/page.jsx, admin/page.jsx, etc.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}