export default function SiteInfoPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen">
            <h1 className="text-3xl font-bold p-8">Heritage Site Details</h1>
            {/* Individual site information - ID: {params.id} */}
        </div>
    );
}
