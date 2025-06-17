"use client";
import dynamic from "next/dynamic";

const DriversMap = dynamic(() => import("./DriversMap"), { ssr: false });

export default function DriversMapClient() {
  return <DriversMap />;
}
