'use client';
import { FunctionComponent, useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { Package, Warehouse, ShoppingCart, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface PurchaseRequestItem {
    id?: number;
    product_id: number;
    quantity: number;
    productName?: string;
}

interface PurchaseRequestDetail {
    id?: number;
    reference: string;
    warehouse_id: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    items: PurchaseRequestItem[];
}

interface Product {
    id: number;
    name: string;
}

interface Warehouse {
    id: number;
    name: string;
}

interface PurchaseRequestDetailPageProps { }

const PurchaseRequestDetailPage: FunctionComponent<PurchaseRequestDetailPageProps> = () => {
    const pathname = usePathname();
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequestDetail>({
        reference: '',
        warehouse_id: 0,
        status: 'DRAFT',
        items: [{ product_id: 0, quantity: 1 }],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch products and warehouses
                const [productsRes, warehousesRes] = await Promise.all([
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/warehouses`),
                ]);

                const productsData = await productsRes.json();
                const warehousesData = await warehousesRes.json();

                setProducts(productsData.data || productsData);
                setWarehouses(warehousesData.data || warehousesData);

                // Fetch purchase request details
                const prId = pathname.split("/").pop();
                console.log("Fetching details for PR ID:", prId);

                const prUrl = `${baseUrl}/purchase/request/${prId}`;
                const response = await fetch(prUrl, {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch purchase request data.");
                }

                const result = await response.json();
                console.log("Purchase Request Data:", result);

                // Fetch product names for items
                const itemsWithNames = await Promise.all(
                    result.data.items.map(async (item: PurchaseRequestItem) => {
                        const product = await fetchProductById(item.product_id);
                        return {
                            ...item,
                            productName: product ? product.name : "Unknown Product"
                        };
                    })
                );

                setPurchaseRequest({
                    ...result.data,
                    items: itemsWithNames
                });

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProductById = async (productId: number) => {
            try {
                const productUrl = `${baseUrl}/products/${productId}`;
                const response = await fetch(productUrl, {
                    method: "GET",
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch product ${productId}`);
                }
                const result = await response.json();
                return result.data || result;
            } catch (error) {
                console.error(`Error fetching product ${productId}:`, error);
                return null;
            }
        };

        fetchData();
    }, [baseUrl, pathname]);

    const handleSave = async () => {
        try {
            setSaving(true);

            const prId = pathname.split("/").pop();
            const prUrl = `${baseUrl}/purchase/request/${prId}`;

            // Prepare data for save (remove productName field)
            const dataToSave = {
                ...purchaseRequest,
                products: purchaseRequest.items.map(({ productName, ...item }) => item)
            };
            console.log("Saving data:", dataToSave);

            const response = await fetch(prUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSave),
            });

            if (!response.ok) {
                throw new Error("Failed to save purchase request");
            }

            const result = await response.json();
            console.log("Save successful:", result);
            alert("Purchase request saved successfully!");

        } catch (error) {
            console.error("Error saving:", error);
            alert("Failed to save purchase request");
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = () => {
        setPurchaseRequest(prev => ({
            ...prev,
            items: [...prev.items, { product_id: 0, quantity: 1 }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setPurchaseRequest(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: number) => {
        setPurchaseRequest(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    // Update product name if product_id changed
                    if (field === 'product_id') {
                        const product = products.find(p => p.id === value);
                        updatedItem.productName = product?.name;
                    }
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const getTotalQuantity = () => {
        return purchaseRequest.items.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm z-40">
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">Management System</p>
                </div>

                <nav className="p-4 space-y-2">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === "/"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        Stock Dashboard
                    </Link>

                    <Link
                        href="/purchase-requests"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === "/purchase-requests"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Purchase Requests
                    </Link>

                    <Link
                        href="/warehouses"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === "/warehouses"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <Warehouse className="w-5 h-5" />
                        Warehouses
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                href="/purchase-requests"
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 no-underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Purchase Requests
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800">
                                Edit Purchase Request
                            </h2>
                            <p className="text-slate-600 mt-1">
                                Modify purchase request details
                            </p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Purchase request details and status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reference">Reference</Label>
                                            <Input
                                                id="reference"
                                                value={purchaseRequest.reference}
                                                onChange={(e) =>
                                                    setPurchaseRequest(prev => ({ ...prev, reference: e.target.value }))
                                                }
                                                disabled
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={purchaseRequest.status}
                                                onValueChange={(value) =>
                                                    setPurchaseRequest(prev => ({ ...prev, status: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                                                    <SelectItem value="PENDING">PENDING</SelectItem>
                                                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="warehouse">Warehouse</Label>
                                            <Select
                                                value={purchaseRequest.warehouse_id === 0 ? undefined : String(purchaseRequest.warehouse_id)}
                                                onValueChange={(value) =>
                                                    setPurchaseRequest(prev => ({ ...prev, warehouse_id: Number(value) }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                            {warehouse.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Items Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Purchase Items</CardTitle>
                                            <CardDescription>
                                                Add and manage items for this purchase request
                                            </CardDescription>
                                        </div>
                                        <Button onClick={handleAddItem} size="sm" className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Custom Table */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-16">#</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Product</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 w-40">Quantity</th>
                                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 w-24">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {purchaseRequest.items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                            No items added yet. Click "Add Item" to get started.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    purchaseRequest.items.map((item, index) => (
                                                        <tr key={index} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Select
                                                                    value={item.product_id === 0 ? undefined : String(item.product_id)}
                                                                    onValueChange={(value) =>
                                                                        handleItemChange(index, 'product_id', Number(value))
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map((product) => (
                                                                            <SelectItem key={product.id} value={String(product.id)}>
                                                                                {product.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) =>
                                                                        handleItemChange(index, 'quantity', Number(e.target.value))
                                                                    }
                                                                    className="w-full"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary */}
                                    {purchaseRequest.items.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Total Items: {purchaseRequest.items.length}
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    Total Quantity: {getTotalQuantity()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PurchaseRequestDetailPage;