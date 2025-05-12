import Link from "next/link";
import { Button } from "./ui/button";
import { getGithubRepoStars } from "@/lib/get-github-repo-stars";
import Image from "next/image";

export default async function Header() {
  const stars = await getGithubRepoStars();
  console.log("stars", stars);
  return (
    <header className="p-4 bg-slate-800 border-b text-white border-slate-700">
      <h1 className="text-2xl font-bold">CLIPS Online Compiler</h1>
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          A simplified CLIPS environment for rule-based programming
        </p>
        <Button className="text-slate-400 text-sm mt-2 p-2">
          <Link
            href="https://github.com/mrgwd/clips-compiler-prerelease"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1 font-bold"
          >
            <Image
              src="./star.svg"
              alt="star"
              width={16}
              height={16}
              className="inline-block"
            />

            <span className="hidden md:inline">{stars} Stars</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
