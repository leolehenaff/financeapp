import { listTransactions } from "@/lib/actions";
import { Transactions } from "@/components/transactions";
import { lists } from "@/lib/queries";
import { Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Journal() {
  const { instruments } = await lists();
  const first = await listTransactions({ from: "", to: "", instrument: "", type: "" }, 1);

  return (
    <>
      <p className="text-[13px] text-ink-2">Journal</p>
      <h1 className="text-[30px] font-bold tracking-[-0.025em] leading-tight mt-0.5">Ce qui a été fait, ce qui reste à faire.</h1>

      <Section title="Transactions">
        <Transactions instruments={instruments.map((i) => ({ id: i.id, name: i.name }))} initial={first} />
      </Section>

    </>
  );
}
