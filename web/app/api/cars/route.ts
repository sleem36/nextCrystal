import { NextResponse } from "next/server";
import { getCars } from "@/lib/cars-source";

export async function GET() {
  try {
    const cars = await getCars();
    return NextResponse.json({ cars });
  } catch {
    return NextResponse.json({ error: "Failed to load cars" }, { status: 500 });
  }
}
