import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import db from '@/db/db';
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
  const sellData = await getSellData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="Sale" subtitle={sellData.amount} body={sellData.numberOfSales} />
    </div>
  );
};

export default page;

type DashboardProps = {
  title: string;
  subtitle: number;
  body: number;
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
