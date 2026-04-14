import { NextResponse } from "next/server";
import { getCarById } from "@/lib/cars-source";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const car = await getCarById(id);
  if (!car) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(car);
}
