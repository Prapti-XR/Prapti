import { Navbar } from '@/components/layout/Navbar';
import { SkeletonSiteDetail } from '@/components/ui/Skeleton';

export default function SiteDetailLoading() {
    return (
        <>
            <Navbar />
            <SkeletonSiteDetail />
        </>
    );
}
