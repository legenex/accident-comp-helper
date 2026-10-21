import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Tabs, Button, TextInput, Toggle } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Save } from 'lucide-react';

const blank = {
  site_name: 'Accident Compensation Helper', domain: 'accidentcompensationhelper.com',
  quiz_url: 'https://quiz.accidentcompensationhelper.com/s/eval', support_email: '', support_phone: '',
  notify_new_lead_email: true, notify_weekly_summary: true, notify_slack_alerts: false,
};

export default function GeneralSettings() {
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.list().then((rows) => setSettings((rows && rows[0]) || { ...blank })).catch(() => setSettings({ ...blank }));
  }, []);

  const save = async () => {
    if (settings.id) await base44.entities.SiteSettings.update(settings.id, settings);
    else { const created = await base44.entities.SiteSettings.create(settings); setSettings(created); }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return null;

  return (
    <AdminLayout>
      <PageHeader title="General" description="Site identity and branding."
        actions={<Button variant="gold" icon={Save} onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button>} />
      <div className="max-w-2xl">
        <Tabs tabs={[{ label: 'General', value: 'general' }, { label: 'Notifications', value: 'notifications' }]} value={tab} onChange={setTab} />
        <div className="mt-4">
          {tab === 'general' && (
            <Panel>
              <div className="space-y-4">
                <TextInput label="Site name" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
                <TextInput label="Domain" value={settings.domain} onChange={(e) => setSettings({ ...settings, domain: e.target.value })} />
                <TextInput label="Quiz / survey URL" hint="Every primary CTA routes here." value={settings.quiz_url} onChange={(e) => setSettings({ ...settings, quiz_url: e.target.value })} />
                <TextInput label="Support email" value={settings.support_email} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} />
                <TextInput label="Support phone" value={settings.support_phone} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })} />
              </div>
            </Panel>
          )}
          {tab === 'notifications' && (
            <Panel>
              <div className="space-y-3">
                {[
                  { key: 'notify_new_lead_email', label: 'Email me when a new lead comes in' },
                  { key: 'notify_weekly_summary', label: 'Weekly performance summary' },
                  { key: 'notify_slack_alerts', label: 'Slack alerts for new leads' },
                ].map((n) => (
                  <label key={n.key} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: '1px solid rgba(148,180,190,0.14)' }}>
                    <span className="text-sm" style={{ color: '#E8F1EF' }}>{n.label}</span>
                    <Toggle checked={!!settings[n.key]} onChange={(v) => setSettings({ ...settings, [n.key]: v })} />
                  </label>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
