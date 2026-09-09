import React from 'react';
import ContentCrudPage from '@/components/admin/ContentCrudPage';
import { TextInput, TextArea, SelectInput } from '@/components/admin/ui';
import { FileText } from 'lucide-react';

const blank = { title: '', slug: '', status: 'draft', body: '', meta_title: '', meta_description: '' };

export default function Pages() {
  return (
    <ContentCrudPage
      entityName="Page"
      title="Pages"
      description="Standalone site pages."
      icon={FileText}
      blank={blank}
      emptyDescription="Create standalone pages like About, FAQ, or a legal notice."
      publicUrlFor={(r) => `/${r.slug}`}
      columns={[
        { key: 'title', header: 'Title' },
        { key: 'slug', header: 'Slug', render: (r) => <span className="font-mono text-xs">/{r.slug}</span> },
        { key: 'meta_title', header: 'Meta title' },
      ]}
      renderForm={(editing, setEditing) => (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <TextInput label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </div>
          <SelectInput label="Status" value={editing.status} options={['draft', 'published', 'archived']} onChange={(e) => setEditing({ ...editing, status: e.target.value })} />
          <TextArea label="Body" rows={10} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          <TextInput label="Meta title" value={editing.meta_title} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
          <TextArea label="Meta description" rows={3} value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
        </div>
      )}
    />
  );
}
