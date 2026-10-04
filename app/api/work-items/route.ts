import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";

const seedItems = [
  ["CRM-1842", "Lead conversion blocked for EMEA sales", "Incident", "In progress", "Critical", 96, "2026-10-04T11:30:00Z", "Nora B.", "Salesforce", "41 opportunities cannot progress to quotation.", "As a sales manager, I need lead conversion to preserve account hierarchy so that quotations can be issued without rework.", "Given an eligible lead, when conversion is confirmed, then account, contact and opportunity records are created once with the original hierarchy.", "Regression running", "R26.10"],
  ["CRM-1837", "Duplicate customer accounts after ERP sync", "Defect", "Qualified", "High", 88, "2026-10-04T15:00:00Z", "Youssef A.", "Monitoring", "Duplicate accounts distort pipeline and customer ownership.", "As a CRM administrator, I need deterministic matching before account creation so customer records remain unique.", "No new account is created when VAT ID or mastered external ID already exists; conflicts are routed for review.", "Ready for UAT", "R26.10"],
  ["CRM-1819", "Guided opportunity close plan", "Evolution", "PO decision", "Medium", 79, "2026-10-06T10:00:00Z", "Amine A.", "Business", "Sales teams report inconsistent close plans across regions.", "As an account executive, I need a guided close plan so that risks, actions and decision makers are visible before commit.", "Close plan is mandatory above threshold; missing actions block Commit; all changes are timestamped.", "Not started", "R26.11"],
  ["CRM-1804", "Customer 360 panel latency above SLA", "Incident", "Fix ready", "High", 84, "2026-10-04T18:00:00Z", "Lina M.", "APM", "Average load time is 8.4 seconds for enterprise accounts.", "As a service agent, I need Customer 360 under three seconds so I can handle interactions without interruption.", "P95 page load is below three seconds for the agreed enterprise data volume.", "Fix validation", "R26.10"],
  ["CRM-1798", "Consent field mandatory for imported contacts", "Request", "Backlog", "Low", 58, null, "Unassigned", "Service desk", "Imported contacts can bypass consent capture.", "As a compliance owner, I need import validation so all marketable contacts have traceable consent.", "Invalid rows are rejected with an actionable error report; valid consent source and timestamp are retained.", "Not started", "Backlog"],
  ["CRM-1785", "Partner portal opportunity visibility", "Evolution", "UAT", "Medium", 73, "2026-10-07T09:00:00Z", "Sarah E.", "Product", "Partners cannot reliably see co-sell opportunity stages.", "As a partner manager, I need stage-level visibility with field restrictions so I can coordinate co-sell activity safely.", "Partner sees approved stages within five minutes; internal-only fields never render; audit event is recorded.", "6/8 passed", "R26.10"],
];

async function ensureSeeded() {
  const db = getDb();
  const count = await db.prepare("SELECT COUNT(*) AS count FROM work_items").first<{ count: number }>();
  if ((count?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const statements = seedItems.map((item) =>
    db.prepare(`INSERT OR IGNORE INTO work_items
      (key,title,type,status,severity,priority_score,sla_due_at,owner,source,business_impact,user_story,acceptance_criteria,test_status,release_name,description,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...item, item[9], now, now),
  );
  await db.batch(statements);
  await db.prepare("INSERT OR IGNORE INTO release_gates (name,target_date,status,readiness_score,blockers,updated_at) VALUES (?,?,?,?,?,?)")
    .bind("R26.10 — Revenue Reliability", "2026-10-09", "Conditional", 82, 2, now).run();
}

export async function GET() {
  try {
    await ensureSeeded();
    const db = getDb();
    const items = await db.prepare("SELECT * FROM work_items ORDER BY priority_score DESC, updated_at DESC").all();
    const activities = await db.prepare("SELECT * FROM activities ORDER BY created_at DESC LIMIT 20").all();
    const release = await db.prepare("SELECT * FROM release_gates ORDER BY id DESC LIMIT 1").first();
    return NextResponse.json({ items: items.results ?? [], activities: activities.results ?? [], release });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    const now = new Date().toISOString();
    const latest = await db.prepare("SELECT id FROM work_items ORDER BY id DESC LIMIT 1").first<{ id: number }>();
    const key = body.key || `CRM-${1900 + (latest?.id ?? 1)}`;
    const result = await db.prepare(`INSERT INTO work_items
      (key,title,description,type,status,severity,priority_score,sla_due_at,owner,source,business_impact,user_story,acceptance_criteria,test_status,release_name,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        key, body.title, body.description ?? "", body.type ?? "Request", body.status ?? "New", body.severity ?? "Medium",
        Number(body.priorityScore ?? 60), body.slaDueAt ?? null, body.owner ?? "Unassigned", body.source ?? "CRM",
        body.businessImpact ?? "", body.userStory ?? "", body.acceptanceCriteria ?? "", body.testStatus ?? "Not started",
        body.releaseName ?? "Backlog", now, now,
      ).run();
    const id = result.meta?.last_row_id;
    await db.prepare("INSERT INTO activities (work_item_id,action,actor,detail,created_at) VALUES (?,?,?,?,?)")
      .bind(id, "created", body.actor ?? "Business Analyst", `${key} entered the control tower`, now).run();
    return NextResponse.json({ ok: true, id, key });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create work item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const allowed: Record<string, string> = {
      status: "status", owner: "owner", severity: "severity", priorityScore: "priority_score",
      userStory: "user_story", acceptanceCriteria: "acceptance_criteria", testStatus: "test_status", releaseName: "release_name",
    };
    const field = allowed[body.field];
    if (!field || !body.id) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    const db = getDb();
    const now = new Date().toISOString();
    await db.prepare(`UPDATE work_items SET ${field} = ?, updated_at = ? WHERE id = ?`).bind(body.value, now, body.id).run();
    await db.prepare("INSERT INTO activities (work_item_id,action,actor,detail,created_at) VALUES (?,?,?,?,?)")
      .bind(body.id, "updated", body.actor ?? "Business Analyst", `${body.field} changed to ${body.value}`, now).run();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update work item" }, { status: 500 });
  }
}
