"use client";

import { useBalance } from "@repo/store/balance";

export default function Page(): JSX.Element {
  const balance = useBalance();
  return (
   <div className="bg-blue-500">
         hi there {balance}
   </div>
  );
}
