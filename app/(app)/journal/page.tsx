import { addAction, completeAction, listTransactions } from "@/lib/actions";
import { Transactions } from "@/components/transactions";
import { dateFr } from "@/lib/format";
import { getActions, lists } from "@/lib/queries";
import { Check, Section } from "@/components/ui";
import { DatePicker } from "@/components/datepicker";

export const dynamic = "force-dynamic";

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`flex flex-col gap-1 text-[12px] text-ink-2 ${className}`}>{label}{children}</label>
);

export default async function Journal() {
  const { instruments } = await lists();
  const actions = await getActions();
  const first = await listTransactions({ from: "", to: "", instrument: "", type: "" }, 1);
  const sections = [...new Set(actions.map((a) => a.section))];
  const open = actions.filter((a) => a.status === "todo").length;

  return (
    <>
      <p className="text-[13px] text-ink-2">Journal</p>
      <h1 className="text-[30px] font-bold tracking-[-0.025em] leading-tight mt-0.5">Ce qui a été fait, ce qui reste à faire.</h1>

      <Section title="Transactions">
        <Transactions instruments={instruments.map((i) => ({ id: i.id, name: i.name }))} initial={first} />
      </Section>

      <Section title="Actions" aside={`${open} ouverte${open > 1 ? "s" : ""}`}>
        <form action={addAction} className="panel p-5 grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end mb-6">
          <Field label="Nouvelle action" className="col-span-2 md:col-span-1"><input name="title" placeholder="Vendre les 88 derniers Capgemini" className="field" required /></Field>
          <Field label="Échéance"><DatePicker name="due_date" placeholder="Sans" /></Field>
          <Field label="Section"><select name="section" className="field">{sections.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <button type="submit" className="btn btn-ghost">Ajouter</button>
        </form>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          {sections.map((s) => (
            <div key={s}>
              <h3 className="text-[13px] font-medium text-ink-2 mb-2">{s}</h3>
              <ul className="divide-y divide-line">
                {actions.filter((a) => a.section === s).map((a) => (
                  <li key={a.id} className="flex gap-3 items-start py-2.5 text-[14px] leading-snug">
                    {a.status === "todo" ? <form action={completeAction.bind(null, a.id)} className="pt-px"><Check /></form> : <Check done />}
                    <span className={a.status !== "todo" ? "text-ink-3" : ""}>
                      {a.due_date && <span className="tnum text-[12px] font-medium px-1.5 py-0.5 rounded-sm mr-2 bg-surface-2 text-ink-2">{dateFr(a.due_date)}</span>}
                      <span className={a.status === "dropped" ? "line-through" : ""}>{a.title}</span>
                      {a.done_on && <span className="text-ink-3 text-[12px]"> fait le {dateFr(a.done_on)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
