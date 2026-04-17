import { NextResponse } from "next/server";
import { getAllCities } from "@/lib/cities-db";

export function GET() {
  try {
    const activeCities = getAllCities(true);
    const sourceCities = activeCities.length > 0 ? activeCities : getAllCities(false);
    const cities = sourceCities.map((city) => ({
      id: city.id,
      slug: city.slug,
      name_imya: city.name_imya,
    }));
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ error: "Failed to load cities" }, { status: 500 });
  }
}
