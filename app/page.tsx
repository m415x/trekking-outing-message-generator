import { PersistentOutingEditor } from "../components/persistent-outing-editor"

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <PersistentOutingEditor />
      </main>
      <footer className="px-4 pb-8 text-center text-sm text-slate-500 sm:px-6">
        Desarrollado con ♥ por Cristian Lahoz
      </footer>
    </>
  )
}
