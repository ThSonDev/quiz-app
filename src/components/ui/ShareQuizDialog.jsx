import { useMemo, useState } from 'react';
import { useTheme } from '../../contexts/useTheme';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { hashQuiz } from '../../utils/storage';
import { downloadQuizFile } from '../../utils/utils';
import { rejectUnsafeUrl } from '../../utils/urlSafety';
import { buildShareUrl, fetchSharedQuiz } from '../../utils/share';
import Modal from './Modal';
import Button from './Button';
import { IconCopy, IconCheck, IconDownload } from './icons';

// Author-side dialog for turning a loaded quiz into a shareable link. The flow:
// (1) download the quiz JSON, (2) host it on a public link (e.g. a GitHub gist
// raw URL), (3) paste that link here to generate a share link. We bake in the
// content hash (so a friend who already has the quiz skips the re-fetch) plus
// the current shuffle/size settings.
const ShareQuizDialog = ({ rawData, name, settings, onClose }) => {
  const { classes, isDarkMode } = useTheme();
  // Lock background (upload page / library pane) scroll while the dialog is open.
  useBodyScrollLock();
  const qid = useMemo(() => hashQuiz(rawData), [rawData]);

  const [url, setUrl] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, message }

  const inputClass = `w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-indigo-500 ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
  }`;

  const handleDownload = () => downloadQuizFile(rawData, name || 'quiz', 'json');

  const handleGenerate = () => {
    const trimmed = url.trim();
    const unsafe = rejectUnsafeUrl(trimmed);
    if (unsafe) {
      setError(unsafe);
      setLink('');
      return;
    }
    setError('');
    setTestResult(null);
    setCopied(false);
    setLink(buildShareUrl(window.location.origin, { url: trimmed, qid, settings }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy automatically — select the link and copy it manually.');
    }
  };

  // Optional sanity check: fetch what the link points at and confirm it matches
  // the quiz the author is sharing. Catches "hosted a different/edited copy".
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const { data, error: fetchError } = await fetchSharedQuiz(url.trim());
    setTesting(false);
    if (fetchError) {
      setTestResult({ ok: false, message: fetchError });
      return;
    }
    setTestResult(
      hashQuiz(data) === qid
        ? { ok: true, message: 'Link works and matches this quiz.' }
        : { ok: false, message: "Link loads, but its content doesn't match this quiz." },
    );
  };

  return (
    <Modal
      title="Share this quiz"
      description="Send a friend a link that loads this quiz with your current settings. Three quick steps:"
      onClose={onClose}
    >
      <div>
        <p className={`text-sm font-medium ${classes.textColor} mb-1`}>1. Download your quiz file</p>
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 !py-2"
        >
          <IconDownload className="w-4 h-4" /> Download .json
        </Button>
        <p className={`text-xs ${classes.mutedText} mt-2`}>
          You can send this file straight to a friend to upload themselves — hosting it (steps 2–3) is only
          needed if you want a one-click share link.
        </p>
      </div>

      <p className={`text-sm ${classes.mutedText}`}>
        2. Upload it somewhere public — for example a{' '}
        <a
          href="https://gist.github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:underline"
        >
          GitHub gist
        </a>{' '}
        — and copy its <strong>Raw</strong> file link.
      </p>

      <div>
        <label htmlFor="shareUrl" className={`block text-sm font-medium ${classes.textColor} mb-1`}>
          3. Paste the public file URL
        </label>
        <input
          id="shareUrl"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://gist.githubusercontent.com/.../quiz.json"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {link && (
        <div className="space-y-2">
          <div className={`p-3 rounded-lg break-all text-sm ${classes.inputBgPlain} ${classes.textColor}`}>
            {link}
          </div>
          <div className="flex gap-2">
            <Button
              variant={copied ? 'success' : 'primary'}
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 !py-2"
            >
              {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="secondary" onClick={handleTest} disabled={testing} className="flex-1 !py-2">
              {testing ? 'Testing…' : 'Test link'}
            </Button>
          </div>
          {testResult && (
            <p className={`text-sm ${testResult.ok ? 'text-green-500' : 'text-amber-500'}`}>
              {testResult.message}
            </p>
          )}
        </div>
      )}

      {!link && (
        <Button onClick={handleGenerate} className="w-full !py-2">
          Generate link
        </Button>
      )}

      <Button variant="neutral" onClick={onClose} className="w-full !py-2">
        Close
      </Button>
    </Modal>
  );
};

export default ShareQuizDialog;
