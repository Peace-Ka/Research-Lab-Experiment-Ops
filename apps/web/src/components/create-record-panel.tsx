'use client';

import { FormEvent, useState } from 'react';

type CreateRecordPanelProps = {
  title: string;
  subtitle: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    type?: 'text' | 'number';
    required?: boolean;
  }>;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};

export function CreateRecordPanel({
  title,
  subtitle,
  fields,
  submitLabel,
  onSubmit,
}: CreateRecordPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    setError('');

    try {
      await onSubmit(values);
      setMessage(`${title} created successfully.`);
      setValues({});
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : `Failed to create ${title.toLowerCase()}.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Create</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="muted">{subtitle}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.multiline ? (
              <textarea
                className="text-area"
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
              />
            ) : (
              <input
                type={field.type ?? 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
              />
            )}
          </label>
        ))}

        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? 'Saving...' : submitLabel}
        </button>
      </form>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}
