import { CitizenDashboardLayout } from "../Components/CitizenDashboardLayout";

export default function BookRecycleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CitizenDashboardLayout>
            {children}
        </CitizenDashboardLayout>
    );
}
