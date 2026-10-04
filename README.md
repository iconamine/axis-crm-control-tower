# AXIS — CRM Control Tower

AXIS is an operational product prototype for CRM Business Analysts, Product Owners, support leads and QA teams. It unifies RUN support and product evolution work from intake through release evidence.

## Operational journey

1. Capture incidents, defects, requests and evolutions in one intake.
2. Qualify business impact and prioritize a shared decision queue.
3. Formalize user stories and acceptance criteria in Spec Studio.
4. Execute UAT, record outcomes and surface blocking defects.
5. Control release readiness with explicit evidence and ownership.
6. Monitor SLA health, work composition and delivery pressure.

## Architecture

- Next.js-compatible Vinext application
- Cloudflare D1 persistent data layer with generated Drizzle migrations
- Shadcn interaction primitives and Recharts operational analytics
- WebMCP read tool for AI-assisted work-item discovery
- Connector-ready Salesforce and Jira adapter boundary

## Local verification

```bash
npm run db:generate
npm run build
npm start
```

The interface includes a continuity mode when the database is unavailable, while deployed environments persist every create and update action through D1.
