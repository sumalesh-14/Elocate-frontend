import DashboardLayout from "./components/DashboardLayout";
import "./admin-globals.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
