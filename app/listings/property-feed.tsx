"use client";
import { useState, useEffect } from "react";
import { filterProperties } from "@/lib/data/server-functions";
import { PropertyCard } from "../../components/property/property-card";

export default function PropertyFeed({
    initialProperties,
    searchParams,
    totalCount: initialTotal
}: {
    initialProperties: any[],
    searchParams: any,
    totalCount: number
}) {
    const [properties, setProperties] = useState(initialProperties);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(initialTotal);

    // If searchParams change (user filters), reset the list
    useEffect(() => {
        setProperties(initialProperties);
        setTotalCount(initialTotal);
    }, [initialProperties, initialTotal]);

    const hasMore = properties.length < totalCount;

    const handleLoadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        const result = await filterProperties({
            ...searchParams,
            limit: 12,
            offset: properties.length // Start from where the current list ends
        });

        if (result?.mappedProperties) {
            // Correctly append new items to the existing array
            setProperties(prev => [...prev, ...result.mappedProperties]);
            // Update total count just in case it changed on the server
            setTotalCount(result.totalCount);
        }
        setLoading(false);
    };

    return (
        <div className="flex-1">
            {properties.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No properties found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-12 flex flex-col items-center gap-2">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all disabled:bg-gray-400"
                            >
                                {loading ? "Searching..." : "Load More Properties"}
                            </button>
                            <p className="text-sm text-gray-500">
                                Showing {properties.length} of {totalCount} results
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}