// Publishes scheduled posts whose publish_at has passed.
//
// Without this, a post set to "scheduled" sits in that state forever and the
// scheduling UI is decorative. Safe to call repeatedly: it only ever moves
// scheduled -> published, and re-running is a no-op once nothing is due.
//
// Intended to run on a schedule (e.g. every 15 minutes). It can also be
// invoked manually from Blog Manager.
//
// The compliance gate still applies: a post carrying unresolved
// compliance_flags is skipped and reported, never auto-published.
import { createClientFromRequest } from 'npm:@base44/sdk';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    const scheduled = await db.entities.BlogPost.filter({ status: 'scheduled' }).catch(() => []);
    const now = Date.now();

    const published = [];
    const skipped = [];

    for (const post of scheduled || []) {
      if (!post.publish_at) {
        skipped.push({ id: post.id, title: post.title, reason: 'no publish_at set' });
        continue;
      }
      const due = new Date(post.publish_at).getTime();
      if (isNaN(due)) {
        skipped.push({ id: post.id, title: post.title, reason: `unparseable publish_at "${post.publish_at}"` });
        continue;
      }
      if (due > now) continue; // not due yet

      if ((post.compliance_flags || []).length > 0) {
        skipped.push({ id: post.id, title: post.title, reason: `${post.compliance_flags.length} unresolved compliance flag(s)` });
        continue;
      }

      await db.entities.BlogPost.update(post.id, {
        status: 'published',
        published_at: post.published_at || new Date().toISOString(),
      });
      published.push({ id: post.id, title: post.title });

      db.entities.AuditLog.create({
        actor_email: 'system:publishScheduledPosts',
        action: 'blog_post.published',
        entity_type: 'BlogPost',
        entity_id: post.id,
        summary: `Auto-published on schedule: ${post.title}`,
      }).catch(() => {});
    }

    return Response.json({ ok: true, checked: (scheduled || []).length, published, skipped });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) });
  }
});
