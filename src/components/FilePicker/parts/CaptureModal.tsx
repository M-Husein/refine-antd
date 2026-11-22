import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Button, Flex, Modal } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { useTranslate } from '@refinedev/core';
import { RECORD_MIME_TYPES } from './data';
import { formatDuration, timestamp } from './utils';
import type { CaptureKind } from './types';

const videoclassName = "block aspect-video w-full object-contain bg-black";

type CaptureModalProps = {
  msg: MessageInstance;
  kind: CaptureKind | null;
  onClose: () => void;
  onCapture: (file: File, kind: CaptureKind) => void;
};

export const CaptureModal = ({ 
  msg,
  kind, 
  onClose, 
  onCapture 
}: CaptureModalProps) => {
  const t = useTranslate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const stopDrawRef = useRef<(() => void) | null>(null); // stops the mirroring canvas loop (webcamRecord)
  const chunksRef = useRef<Blob[]>([]);
  const [shot, setShot] = useState<{ file: File; url: string } | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<{ file: File; url: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // 3 → 2 → 1 before a recording starts
  const countdownTimerRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds recorded (live while recording, final after stop)
  const startedAtRef = useRef(0); // set by recorder.onstart

  // Recording timer: derived from Date.now() so it stays accurate even if a tick is delayed.
  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [isRecording]);

  const handleClose = useEffectEvent(() => onClose());
  const handleError = useEffectEvent((key: string, fallback: string) => msg.error(t(key, fallback)));
  const handleWarn = useEffectEvent((key: string, fallback: string) => msg.warning(t(key, fallback)));

  // The user stopped sharing from the browser UI: finish a running recording instead of losing it.
  const handleEnded = useEffectEvent(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') recorder.stop();
    else onClose();
  });

  // Drops the recorder without producing a file (modal closed / unmounted).
  const discardRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      // stop() throws InvalidStateError on an inactive recorder
      if (recorder.state !== 'inactive') recorder.stop();
    }
    stopDrawRef.current?.();
    stopDrawRef.current = null;
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const stopStream = useCallback(() => {
    clearCountdown();
    discardRecorder();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [clearCountdown, discardRecorder]);

  const setVideoEl = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
    }
  }, []);

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- reset the review state each time the modal opens */
    setShot(null);
    setRecordedVideo(null);
    setIsRecording(false);
    setIsVideoReady(false);
    setCountdown(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const getWebcam = (audio: boolean) =>
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio });

        let stream: MediaStream;
        if (kind === 'webcam') {
          stream = await getWebcam(false);
        } else if (kind === 'webcamRecord') {
          try {
            stream = await getWebcam(true);
          } catch (err) {
            // No microphone: record without sound instead of failing completely
            if (cancelled || (err as DOMException)?.name !== 'NotFoundError') throw err;
            stream = await getWebcam(false);
            if (!cancelled) handleWarn('filePicker.noMicrophone', 'No microphone found, recording without sound.');
          }
        } else {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: kind === 'screenRecord',
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        stream.getVideoTracks()[0]?.addEventListener('ended', () => handleEnded());
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        if (name !== 'AbortError' && name !== 'NotAllowedError') {
          handleError('filePicker.captureFailed', 'Unable to access the device.');
        } else if (name === 'NotAllowedError' && (kind === 'webcam' || kind === 'webcamRecord')) {
          handleError('filePicker.permissionDenied', 'Permission denied.');
        }
        handleClose();
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [kind, stopStream]);

  useEffect(() => {
    return () => {
      if (shot?.url) URL.revokeObjectURL(shot.url);
      if (recordedVideo?.url) URL.revokeObjectURL(recordedVideo.url);
    };
  }, [shot, recordedVideo]);

  const startRecording = () => {
    const video = videoRef.current;
    const source = streamRef.current;
    if (!video || !source || !kind) return;
    chunksRef.current = [];

    let recordStream: MediaStream = source;

    if (kind === 'webcamRecord') {
      // Mirror the RECORDED FILE (not just the preview): draw every frame flipped on a canvas
      // and record the canvas stream, plus the original audio.
      const width = video.videoWidth;
      const height = video.videoHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx || !width || !height) {
        msg.error(t('filePicker.captureFailed', 'Unable to access the device.'));
        return;
      }

      let raf = 0;
      const draw = () => {
        ctx.setTransform(-1, 0, 0, 1, width, 0); // horizontal flip
        ctx.drawImage(video, 0, 0, width, height);
        raf = requestAnimationFrame(draw);
      };
      draw();

      const mirrored = canvas.captureStream(30);
      source.getAudioTracks().forEach((track) => mirrored.addTrack(track));
      recordStream = mirrored;
      // Only stop the canvas video track: the audio track is shared with the live stream (needed for "Retake").
      stopDrawRef.current = () => {
        cancelAnimationFrame(raf);
        mirrored.getVideoTracks().forEach((track) => track.stop());
      };
    }

    const mimeType = RECORD_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : undefined);
    } catch {
      stopDrawRef.current?.();
      stopDrawRef.current = null;
      msg.error(t('filePicker.recordNotSupported', 'Recording is not supported by this browser.'));
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    // Start the timer only once the recorder is really running (00:00 matches the file's first frame).
    recorder.onstart = () => {
      startedAtRef.current = Date.now();
      setElapsed(0);
      setIsRecording(true);
    };
    recorder.onstop = () => {
      stopDrawRef.current?.();
      stopDrawRef.current = null;
      // Final duration from the same clock: video.duration of a MediaRecorder .webm is often Infinity.
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000));

      const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0];
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const prefix = kind === 'webcamRecord' ? 'webcam' : 'screen';
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `${prefix}-record-${timestamp()}.${ext}`, { type });
      setRecordedVideo({ file, url: URL.createObjectURL(file) });
      setIsRecording(false);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // Webcam and screen recordings start after a 3-2-1 countdown (like the Windows 11 Snipping Tool).
  const beginRecording = () => {
    if (countdownTimerRef.current !== null) return;

    let remaining = 3;
    setCountdown(remaining);
    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        clearCountdown();
        startRecording();
      }
    }, 1e3);
  };

  const retakeVideo = () => {
    // The user stopped sharing (screen) while recording: the stream is dead, nothing to retake from.
    if (streamRef.current?.getVideoTracks()[0]?.readyState === 'ended') {
      onClose();
      return;
    }
    if (recordedVideo?.url) URL.revokeObjectURL(recordedVideo.url);
    setRecordedVideo(null);
    setIsVideoReady(false);
  };

  const retakeShot = () => {
    if (shot?.url) URL.revokeObjectURL(shot.url);
    setShot(null);
    setIsVideoReady(false);
  };

  const confirmVideo = () => {
    if (recordedVideo && kind) onCapture(recordedVideo.file, kind);
    onClose();
  };

  const confirmShot = () => {
    if (shot && kind) onCapture(shot.file, kind);
    onClose();
  };

  const takeShot = () => {
    const video = videoRef.current;
    if (!video || !kind) {
      msg.error('Video element not ready.');
      return;
    }

    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    if (width === 0 || height === 0) {
      msg.error('Video dimensions are not available. Please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (kind === 'webcam' || kind === 'webcamRecord') {
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
    }
    
    try {
      ctx?.drawImage(video, 0, 0, width, height);
    } catch (e) {
      console.error("Failed to draw video to canvas", e);
      msg.error("Failed to capture image. Please try again.");
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const prefix = kind.includes('webcam') ? 'webcam' : 'screen';
        const file = new File([blob], `${prefix}-${timestamp()}.png`, { type: 'image/png' });
        setShot({ file, url: URL.createObjectURL(file) });
      } else {
        msg.error('Failed to generate image blob.');
      }
    }, 'image/png');
  };

  return (
    <Modal
      open={!!kind}
      onCancel={onClose}
      centered
      width={725}
      title={
        kind === 'webcam'
          ? t('filePicker.webcam', 'Take a photo')
          : kind === 'webcamRecord'
          ? t('filePicker.webcamRecord', 'Record Video')
          : kind === 'screen'
          ? t('filePicker.screenCapture', 'Capture screen')
          : t('filePicker.screenRecord', 'Record Screen')
      }
      classNames={{
        body: "-mx-6 relative"
      }}
      afterClose={stopStream}
      footer={
        recordedVideo || shot ? (
          <Flex gap={8} justify="flex-end">
            <Button onClick={recordedVideo ? retakeVideo : retakeShot}>
              {t('filePicker.retake', 'Retake')}
            </Button>
            <Button type="primary" onClick={recordedVideo ? confirmVideo : confirmShot}>
              {t('filePicker.use', 'Use')}
            </Button>
          </Flex>
        ) : countdown !== null ? (
          <Flex gap={8} justify="flex-end">
            <Button onClick={clearCountdown}>{t('buttons.cancel', 'Cancel')}</Button>
          </Flex>
        ) : isRecording ? (
          <Flex gap={8} justify="flex-end">
            <Button danger onClick={stopRecording}>
              {t('filePicker.stopRecording', 'Stop Recording')}
            </Button>
          </Flex>
        ) : (
          <Flex gap={8} justify="flex-end">
            <Button onClick={onClose}>{t('buttons.cancel', 'Cancel')}</Button>
            {kind === 'webcam' || kind === 'screen' ? (
              <Button type="primary" onClick={takeShot} disabled={!isVideoReady}>
                {t('filePicker.capture', 'Capture')}
              </Button>
            ) : (
              <Button type="primary" onClick={beginRecording} disabled={!isVideoReady}>
                {t('filePicker.startRecording', 'Start Recording')}
              </Button>
            )}
          </Flex>
        )
      }
    >
      {!recordedVideo && !shot && (
        <video
          ref={setVideoEl}
          autoPlay
          playsInline
          muted
          disablePictureInPicture
          className={(kind === 'webcam' || kind === 'webcamRecord' ? 'mirror ' : '') + videoclassName}
          onContextMenu={evt => evt.preventDefault()}
          onLoadedData={() => setIsVideoReady(true)}
        />
      )}
      {recordedVideo && (
        <video
          autoPlay
          playsInline
          controls
          disablePictureInPicture
          src={recordedVideo.url}
          // No "mirror" class: a webcam recording is already mirrored inside the file itself
          className={videoclassName}
        />
      )}
      {shot && <img src={shot.url} alt="" className={videoclassName} />}

      {recordedVideo && (
        <div className="flex items-center px-2 bg-gray-50 border shadow rounded-full absolute top-1 ml-1 font-bold">
          <time className="font-mono" dateTime={`PT${elapsed}S`}>{formatDuration(elapsed)}</time>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 px-2 bg-gray-50 border shadow rounded-full absolute top-1 ml-1 font-bold">
          <b className="bg-red-600 h-3 w-3 rounded-full animate-pulse" />
          REC
          <time className="font-mono" dateTime={`PT${elapsed}S`}>
            - {formatDuration(elapsed)}
          </time>
        </div>
      )}

      {countdown !== null && (
        <div
          key={countdown}
          role="timer"
          aria-live="assertive"
          className="fixed inset-0 grid place-content-center text-center bg-black/40 text-white font-bold pointer-events-none"
          style={{ 
            zIndex: 1056, 
            fontSize: 80, 
            textShadow: '0 2px 16px rgb(0 0 0 / 60%)' 
          }}
        >
          {countdown}
          <Button 
            size="large" 
            className="pointer-events-auto"
            onClick={clearCountdown}
          >
            {t('buttons.cancel', 'Cancel')}
          </Button>
        </div>
      )}
    </Modal>
  );
};
