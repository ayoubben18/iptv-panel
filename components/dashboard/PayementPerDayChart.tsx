"use client";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PaymentsPerDay } from "@/db/schema";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { parseAsInteger, useQueryState } from "nuqs";

type Props = {
  data: PaymentsPerDay[];
};

const chartConfig = {
  total_payments: {
    label: "Payements",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const PayementPerDayChart = ({ data }: Props) => {
  const [days, setDays] = useQueryState("days", parseAsInteger.withDefault(7));

  const medianPayement =
    data.reduce((acc, curr) => acc + curr.total_payments, 0) / data.length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Payements per day</CardTitle>
          <CardDescription>
            Showing total payements for the last {days} days
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="daysSelect" className="text-sm font-medium">
            Days:
          </label>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              right: 21,
            }}
          >
            <CartesianGrid vertical horizontal />
            <XAxis
              reversed
              dataKey="payment_date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                return format(new Date(value), "dd MMM");
              }}
            />
            <YAxis dataKey="total_payments" tickLine={true} axisLine={true} />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              animationDuration={1000}
              dataKey="total_payments"
              type="bump"
              stroke="var(--color-total_payments)"
              strokeWidth={3}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Median payement of {medianPayement.toFixed(2)}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total Sales for the last {days} days
        </div>
      </CardFooter>
    </Card>
  );
};

export default PayementPerDayChart;
