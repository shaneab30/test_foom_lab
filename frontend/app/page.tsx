'use client';
import { FunctionComponent, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { Package, Warehouse, ShoppingCart, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


interface Stock {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
}

interface EnrichedStock extends Stock {
  productName?: string;
  warehouseName?: string;
}

interface HomePageProps { }

const HomePage: FunctionComponent<HomePageProps> = () => {

  const [stockDatas, setStockDatas] = useState<EnrichedStock[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const stockUrl = baseUrl + "/stocks";
        const response = await fetch(stockUrl, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch stock data.");
        }
        const result = await response.json();
        const stocks: Stock[] = result.data || result;

        const enrichedStocks: EnrichedStock[] = await Promise.all(
          stocks.map(async (stock) => {
            const product = await fetchProductById(stock.product_id);
            const warehouse = await fetchWarehouseById(stock.warehouse_id);
            return {
              ...stock,
              productName: product ? product.name : "Unknown Product",
              warehouseName: warehouse ? warehouse.name : "Unknown Warehouse",
            };
          })
        );

        setStockDatas(enrichedStocks);
        console.log("Enriched stocks:", enrichedStocks);

      } catch (error) {
        console.error("Error fetching stocks:", error);
      } finally {
        setLoading(false);
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

    fetchStocks();
  }, [baseUrl]);

  const filteredStocks = stockDatas.filter(
    (stock) =>
      stock.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2 className="text-3xl font-semibold text-slate-800 mb-6">Stock Dashboard</h2>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Welcome to the Inventory Management System</CardTitle>
            <CardDescription>
              Monitor and manage your stock levels across all warehouses efficiently.
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Stock Dashboard</TableCaption>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Stock ID</TableHead>
                  <TableHead className="font-semibold">Warehouse Name</TableHead>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <TableRow key={stock.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium text-slate-700">#{stock.id}</TableCell>
                          <TableCell className="text-slate-600">{stock.warehouseName}</TableCell>
                          <TableCell className="text-slate-600">{stock.productName}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              stock.quantity > 50 
                                ? "bg-green-100 text-green-700" 
                                : stock.quantity > 20 
                                ? "bg-yellow-100 text-yellow-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {stock.quantity}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="text-center py-12 text-slate-500">
                            {searchQuery ? "No stocks found matching your search" : "No stock data available"}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>




    </div>

  );
};

export default HomePage;