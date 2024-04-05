import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import db from '@/db/db';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import React from 'react';

const page = async () => {
  async function getSellData() {
    const data = await db.order.aggregate({
      _sum: { priceInCents: true },
      _count: true
    });

    return {
      amount: (data._sum.priceInCents || 0) / 100,
      numberOfSales: data._count
    };
  }

  const [sellData, userData] = await Promise.all([getSellData(), getUserData()]);

  async function getUserData() {
    const [userCount, orderData] = await Promise.all([
      db.user.count(),
      db.order.aggregate({
        _sum: { pricePaidInCents: true }
      })
    ]);
    return { userCount, averageValuePerUser: userCount == 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100 };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="Sale" subtitle={`${formatNumber(sellData.amount)} orders`} body={formatCurrency(sellData.numberOfSales)} />
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
        <CardHeader>{title}</CardHeader>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
