import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader, Panel, Button, TextInput, SelectInput, Toggle, FieldRow } from '@/components/admin/ui';
import { base44 } from '@/api/base44Client';
import { Save } from 'lucide-react';

const blank = { enabled: false, display_name: 'Claim Assistant', greeting_message: '', placement: 'bottom_right', model: 'default', handoff_url: 'https://quiz.accidentcompensationhelper.com/s/eval' };

export default function BotSettings() {
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.BotConfig.list().then((rows) => setConfig((rows && rows[0]) || { ...blank })).catch(() => setConfig({ ...blank }));
  }, []);

  const save = async () => {
    if (config.id) await base44.entities.BotConfig.update(config.id, config);
    else { const created = await base44.entities.BotConfig.create(config); setConfig(created); }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (!config) return null;

  return (
    <AdminLayout>
      <PageHeader title="Bot Settings" description="Appearance, behaviour, placement, model, and knowledge assignment. Operational conversations and the test surface live under Bot."
        actions={<Button variant="gold" icon={Save} onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button>} />
      <div className="max-w-xl">
        <Panel>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: '#E8F1EF' }}>
              <Toggle checked={!!config.enabled} onChange={(v) => setConfig({ ...config, enabled: v })} /> Bot enabled on the public site
            </label>
            <TextInput label="Display name" value={config.display_name} onChange={(e) => setConfig({ ...config, display_name: e.target.value })} />
            <TextInput label="Greeting message" value={config.greeting_message} onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })} />
            <SelectInput label="Placement" value={config.placement} options={['bottom_right', 'bottom_left', 'inline']} onChange={(e) => setConfig({ ...config, placement: e.target.value })} />
            <TextInput label="Hand-off URL" hint="Where the bot sends someone ready to start a real claim check" value={config.handoff_url} onChange={(e) => setConfig({ ...config, handoff_url: e.target.value })} />
            <FieldRow label="Knowledge assigned" value="Manage in Settings → Knowledge Base" />
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
