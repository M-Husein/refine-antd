import { useEffect, useRef, useState } from 'react';
import { Button, Flex, Input, Modal } from 'antd';
import { useTranslate } from '@refinedev/core';
import { UrlError, urlToFile } from './utils';
import type { UrlErrorCode, UrlToFileOptions } from './types';

type UrlModalProps = {
  open: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
} & Pick<UrlToFileOptions, 'accept' | 'timeout' | 'fetchUrl'>;

export const UrlModal = ({ open, onClose, onFile, ...options }: UrlModalProps) => {
  const t = useTranslate();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const describe = (err: unknown) => {
    const code: UrlErrorCode = err instanceof UrlError ? err.code : 'network';
    switch (code) {
      case 'invalid':
        return t('filePicker.urlInvalid', 'Enter a valid URL, e.g. https://example.com/image.png');
      case 'protocol':
        return t('filePicker.urlProtocol', 'Only http:// and https:// links are supported.');
      case 'http': {
        const status = err instanceof UrlError ? err.status : undefined;
        return t('filePicker.urlHttp', { status }, `The server responded with an error (${status}).`);
      }
      case 'timeout':
        return t('filePicker.urlTimeout', 'The request took too long.');
      case 'type':
        return t('filePicker.notAccepted', 'This file type is not accepted.');
      default:
        return t(
          'filePicker.urlNetwork',
          'Unable to download the file. The server may block requests from this site (CORS) or the link is unreachable.'
        );
    }
  };

  const close = () => {
    abortRef.current?.abort();
    onClose();
  };

  const submit = async () => {
    const url = value.trim();
    if (!url || loading) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const file = await urlToFile(url, { ...options, signal: ctrl.signal });
      onFile(file);
      onClose();
    } catch (err) {
      if (!ctrl.signal.aborted) setError(describe(err));
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      centered
      title={t('filePicker.fromUrl', 'From URL')}
      afterClose={() => {
        setValue('');
        setError(null);
        setLoading(false);
      }}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button onClick={close}>{t('buttons.cancel', 'Cancel')}</Button>
          <Button type="primary" loading={loading} disabled={!value.trim()} onClick={submit}>
            {t('filePicker.fetch', 'Add')}
          </Button>
        </Flex>
      }
    >
      <Input
        type="url"
        autoFocus
        allowClear
        inputMode="url"
        value={value}
        disabled={loading}
        status={error ? 'error' : undefined}
        placeholder={t('filePicker.urlPlaceholder', 'https://example.com/image.png')}
        // aria-label={t('filePicker.fromUrl', 'From URL')}
        // aria-invalid={!!error}
        onChange={(evt) => {
          setValue(evt.target.value);
          if (error) setError(null);
        }}
        onPressEnter={submit}
      />
      {!!error && (
        <div role="alert" className="mt-1 text-red-700 text-xs">
          {error}
        </div>
      )}
    </Modal>
  );
};
