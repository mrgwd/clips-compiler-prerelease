import ClipsEditor from "@/components/editor";
import Header from "@/components/header";

export default function page() {
  return (
    <main className="h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <ClipsEditor />
      </div>
    </main>
  );
}
