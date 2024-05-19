import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import React from "react";

const page = async () => {
  async function getSellData() {
    const data = await db.order.aggregate({
      _sum: { pricePainInCents: true },
      _count: true,
    });

    return {
      amount: (data._sum.pricePainInCents || 0) / 100,
      numberOfSales: data._count,
    };
  }

  async function getUserData() {
    const [userCount, orderData] = await Promise.all([
      db.user.count(),
      db.order.aggregate({
        _sum: { pricePainInCents: true },
      }),
    ]);
    return {
      userCount,
      averageValuePerUser:
        userCount == 0
          ? 0
          : (orderData._sum.pricePainInCents || 0) / userCount / 100,
    };
  }

  async function getProductData() {
    const [inactiveCount, activeCount] = await Promise.all([
      db.product.count({ where: { isAvailableProductForPurchase: false } }),
      db.product.count({ where: { isAvailableProductForPurchase: true } }),
    ]);
    return {
      activeCount,
      inactiveCount,
    };
  }

  const [sellData, userData, productData] = await Promise.all([
    getSellData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <DashboardCard
        title="Sale"
        subtitle={`${formatNumber(sellData.amount)} orders`}
        body={formatCurrency(sellData.numberOfSales)}
      />
      <DashboardCard
        title="Customer"
        subtitle={`$${formatNumber(
          userData.averageValuePerUser
        )} Average value`}
        body={formatCurrency(userData.userCount)}
      />
      <DashboardCard
        title="Active Product"
        subtitle={`${formatNumber(productData.inactiveCount)} inactive`}
        body={formatNumber(productData.activeCount)}
      />
    </div>
  );
};

export default page;

type DashboardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
