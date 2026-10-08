import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { readStore } from "@/lib/store";

function toCsvRow(values: (string | number)[]): string {
  return values
    .map((value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    })
    .join(",");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") === "enquiries" ? "enquiries" : "orders";
  const { orders, enquiries } = await readStore();

  let csv: string;
  let filename: string;

  if (type === "enquiries") {
    const header = toCsvRow(["Name", "Phone", "Email", "City", "Type", "Organisation", "Contacted", "Created At"]);
    const rows = enquiries.map((item) =>
      toCsvRow([item.name, item.phone, item.email ?? "", item.city, item.type, item.organisation ?? "", item.contacted ? "Yes" : "No", item.createdAt])
    );
    csv = [header, ...rows].join("\n");
    filename = "enquiries.csv";
  } else {
    const header = toCsvRow(["Name", "Phone", "Email", "City", "Status", "Items", "Total", "Contacted", "Created At"]);
    const rows = orders.map((item) =>
      toCsvRow([
        item.customer.name,
        item.customer.phone,
        item.customer.email,
        item.customer.city,
        item.status,
        item.items.map((line) => line.name).join(" + "),
        item.total,
        item.contacted ? "Yes" : "No",
        item.createdAt,
      ])
    );
    csv = [header, ...rows].join("\n");
    filename = "orders.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
