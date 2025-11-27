import React, { useMemo } from "react";
import db from "../../instant";

const CurrentStockLevelsReport: React.FC = () => {
    const { isLoading, error, data } = db.useQuery({
        InventoryItems: {
            $: {
                order: { lastStockedAt: "desc" },
            },
            attributes: {
                category: {},
            },
            supplier: {},
        },
    });

    const items = useMemo(() => data?.InventoryItems || [], [data?.InventoryItems]);

    const getInventoryItemName = (item: typeof items[0]) => {
        if (!item.attributes || item.attributes.length === 0) return "N/A";
        return item.attributes
            .map((attr) =>
                attr.category?.title ? `${attr.category.title}: ${attr.name}` : attr.name,
            )
            .join(", ");
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Current Stock Levels</h2>

            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}

            <div className="overflow-auto max-h-[calc(100vh-300px)] border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Item Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Quantity on Hand
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Price
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Supplier
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Last Stocked Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getInventoryItemName(item)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.costPrice ? `$${item.costPrice.toFixed(2)}` : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.supplier?.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(item.lastStockedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CurrentStockLevelsReport;
