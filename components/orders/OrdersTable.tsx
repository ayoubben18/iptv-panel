"use client";

import { supabase } from "@/clients/supabaseCLient";
import { OrderRow } from "@/components/home/OrderRows";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentOrders } from "@/db/data/subscriptions-data";
import { Subscriptions } from "@/types/tables.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

const OrdersTable = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["subscriptions", page],
    queryFn: () => getRecentOrders(page, itemsPerPage),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime subscriptions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "subscriptions" },
        (payload) => {
          toast.info(`New order: ${payload.new.id}`);
          queryClient.setQueryData(
            ["subscriptions", page],
            (oldData: Subscriptions[] | undefined) => {
              if (!oldData) return [payload.new as Subscriptions];
              return [payload.new as Subscriptions, ...oldData.slice(0, 9)];
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, page]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
              </TableRow>
            ))
          ) : orders ? (
            orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                index={index + (page - 1) * itemsPerPage}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Previous
        </Button>
        <Button
          disabled={!orders || orders.length < itemsPerPage}
          onClick={() => setPage((prev) => prev + 1)}
          variant="outline"
          className="flex items-center gap-2"
        >
          Next
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OrdersTable;
