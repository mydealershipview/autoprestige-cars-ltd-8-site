import Link from 'next/link'

export default function StockAdminSoldCarsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Manage sold cars in MyDealershipView</h1>
      <p className="mb-6 text-base text-zinc-300">
        Open the car in your DMS and use Website sold page to choose whether it appears here.
        Always use Mark as Sold to keep the car’s sales records.
      </p>
      <Link href="/usedcars/searchgroup/sold" className="text-base text-amber-300 underline underline-offset-4">
        View sold cars
      </Link>
    </main>
  )
}
