import DashboardLayout from "./Components/DashboardLayout";
import "./intermediary-globals.css";

export default function IntermediaryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
