"use client";

import { useEffect, useState, useRef } from "react";
import { getInvoices, Invoice } from "@/lib/actions/invoiceActions";
import { useSocketProgress } from "@/hooks/use-socket-progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPresignedDownloadUrl } from "@/lib/actions/uploadFileActions";
import { toast } from "sonner";

interface InvoiceListProps {
  initialInvoices: Invoice[];
}

export function InvoiceList({ initialInvoices }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const { progressMap } = useSocketProgress();
  
  // Track processed files to avoid infinite loops or double fetches
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let shouldRefresh = false;

    for (const [filename, progress] of Object.entries(progressMap)) {
      if (progress === 100) {
        if (!processedRef.current.has(filename)) {
          processedRef.current.add(filename);
          shouldRefresh = true;
        }
      }
    }

    if (shouldRefresh) {
        setTimeout(() => {
            refreshInvoices();
        }, 1000)
    }
  }, [progressMap]);

  const refreshInvoices = async () => {
    const data = await getInvoices();
    setInvoices(data);
  };

  const handleDownload = async (bucketName: string, objectName: string) => {
    try {
        const { success, url, error } = await getPresignedDownloadUrl(bucketName, objectName);
        if (success && url) {
            window.open(url, "_blank");
        } else {
            toast.error(error || "Failed to download file");
        }
    } catch (err) {
        toast.error("An unexpected error occurred");
    }
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Extracted Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-sm overflow-hidden border">
          <Table className="w-full ">
            <TableHeader className="bg-zinc-50">
              <TableRow className="h-16 font-bold text-md">
                <TableHead>Shop Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow className="h-12" key={invoice.id}>
                    <TableCell>{invoice.shop_name}</TableCell>
                    <TableCell>
                      {invoice.invoice_date 
                        ? new Date(invoice.invoice_date).toLocaleDateString() 
                        : "N/A"}
                    </TableCell>
                    <TableCell>{invoice.invoice_number || "N/A"}</TableCell>
                    <TableCell>{invoice.item_count}</TableCell>
                    <TableCell className="text-right">
                      {typeof invoice.total_amount === 'number' 
                        ? `€${Number(invoice.total_amount).toFixed(2)}` 
                        : invoice.total_amount}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.total_tax_amount 
                         ? `€${Number(invoice.total_tax_amount).toFixed(2)}` 
                         : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-indigo-500 mono text-xs">
                        {invoice.original_filename}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                            onClick={() => handleDownload(invoice.bucket_name, invoice.file_path)}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
