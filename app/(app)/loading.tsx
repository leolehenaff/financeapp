/** Affiché dès le clic sur un onglet, le temps que le serveur rende la page. */
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement">
      <div className="h-8 w-48 rounded-full bg-surface-2" />
      <div className="panel h-40" />
      <div className="panel h-64" />
    </div>
  );
}
