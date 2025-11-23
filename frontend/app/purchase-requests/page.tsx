'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, ShoppingCart, Search, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FunctionComponent, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PurchaseRequestItem {
  id: number;
  purchase_request_id: number;
  product_id: number;
  quantity: number;
}

interface PurchaseRequest {
  id: number;
  reference: string;
  warehouse_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseRequestItem[];
}

interface EnrichedPurchaseRequest extends PurchaseRequest {
  warehouseName?: string;
  totalQuantity: number;
  productNames: string[];
}


interface PurchaseRequestProps {

}

const PurchaseRequest: FunctionComponent<PurchaseRequestProps> = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPurchaseRequests = async () => {
      try {
        const stockUrl = baseUrl + "/purchase/request";
        const response = await fetch(stockUrl, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch purchase request data.");
        }
        const result = await response.json();
        const prs: PurchaseRequest[] = result.data || result;

        const enrichedPrs: EnrichedPurchaseRequest[] = await Promise.all(
          prs.map(async (pr) => {
            const warehouse = await fetchWarehouseById(pr.warehouse_id);
            const productNames: string[] = [];
            for (const item of pr.items) {
              const product = await fetchProductById(item.product_id);
              productNames.push(product ? product.name : "Unknown Product");
            }
            return {
              ...pr,
              warehouseName: warehouse ? warehouse.name : "Unknown Warehouse",
              productNames: productNames,
              totalQuantity: pr.items.reduce((total, item) => total + item.quantity, 0),
            };
          })
        );

        setPurchaseRequests(enrichedPrs);


        setLoading(false);
        console.log("Enriched purchase requests:", enrichedPrs);
      } catch (error) {
        console.error("Error fetching purchase requests:", error);
      }
    };

    const fetchProductById = async (productId: number) => {
      try {
        const productUrl = baseUrl + `/products/${productId}`;
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

    const fetchWarehouseById = async (warehouseId: number) => {
      try {
        const warehouseUrl = baseUrl + `/warehouses/${warehouseId}`;
        const response = await fetch(warehouseUrl, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch warehouse ${warehouseId}`);
        }
        const result = await response.json();
        return result.data || result;
      } catch (error) {
        console.error(`Error fetching warehouse ${warehouseId}:`, error);
        return null;
      }
    };


    fetchPurchaseRequests();
  }, [baseUrl]);


  const filteredPr = purchaseRequests.filter(
    (pr) =>
      pr.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className="ml-64 p-8">
        <h2 className="text-3xl font-semibold text-slate-800 mb-6">Purchase Request Dashboard</h2>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Welcome to the Inventory Management System</CardTitle>
            <CardDescription>
              Monitor and manage your purchase requests across all warehouses efficiently.
            </CardDescription>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search products or warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Purchase Request Dashboard</h2>
                <p className="text-slate-600 mt-1">Track and manage purchase requests across all warehouses</p>
              </div>
              <Link href="/purchase-requests/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Request
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Purchase Request Dashboard</TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Purchase Request ID</TableHead>
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold">Warehouse</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Total Quantity</TableHead>
                  <TableHead className="font-semibold">Request Date</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPr.length > 0 ? (
                  filteredPr.map((pr) => (
                    <TableRow key={pr.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-700">{pr.id}</TableCell>
                      <TableCell className="font-medium text-slate-700">{pr.reference}</TableCell>
                      <TableCell className="text-slate-600">{pr.warehouseName}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {pr.productNames.map((name: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700"
                            >
                              {name} ({pr.items[idx].quantity})
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${pr.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : pr.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {pr.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pr.totalQuantity > 50
                            ? "bg-green-100 text-green-700"
                            : pr.totalQuantity > 20
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                            }`}
                        >
                          {pr.totalQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(pr.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/purchase-requests/${pr.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="text-center py-12 text-slate-500">
                        {searchQuery
                          ? "No purchase requests found matching your search"
                          : "No purchase request data available"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>);
}

export default PurchaseRequest;