import { Suspense } from "react";
import MyRequestsList from "./MyRequestsList";

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<div>Loading requests...</div>}>
            <MyRequestsList />
        </Suspense>
    );
}
