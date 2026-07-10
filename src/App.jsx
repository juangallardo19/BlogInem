import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SiteHeader } from './components/SiteHeader.jsx';
import { forumRoute } from './data/portalSections.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import { PortalPage, prefetchPortalContent } from './pages/PortalPage.jsx';
import {
  cleanOrphanRecords,
  deleteComment,
  deleteExperience,
  getComments,
  getExperiences,
  submitComment,
  submitExperience,
  validateAdmin
} from './api.js';
import { Icon, icons } from './icons.jsx';
import { fileToBase64, formatDate, formatFileSize, getPublicationSuffix, MAX_AUDIO_SIZE, MAX_VIDEO_SIZE } from './utils.js';

const publicationsPerPage = 5;


function App() {
  const currentRoute = useHashRoute();
  const [publications, setPublications] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const forumRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  const showMessage = useCallback((message, type = 'info') => {
    window.clearTimeout(statusTimeoutRef.current);
    setStatus({ message, type });
    statusTimeoutRef.current = window.setTimeout(() => setStatus(null), 5000);
  }, []);

  const loadPublications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExperiences();
      setPublications(data);
      prefetchPortalContent();
    } catch (error) {
      showMessage(`Error loading: ${error.message}`, 'error');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadPublications();
    setIsAdminMode(localStorage.getItem('adminMode') === 'true');
    return () => window.clearTimeout(statusTimeoutRef.current);
  }, [loadPublications]);

  const filteredPublications = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return publications;
    return publications.filter((publication) => {
      return [publication.studentName, publication.experience, publication.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [publications, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPublications.length / publicationsPerPage));
  const visiblePublications = filteredPublications.slice(
    (currentPage - 1) * publicationsPerPage,
    currentPage * publicationsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function handleSubmitted() {
    await loadPublications();
    forumRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function enableAdminMode() {
    localStorage.setItem('adminMode', 'true');
    setIsAdminMode(true);
  }

  function disableAdminMode() {
    localStorage.removeItem('adminMode');
    setIsAdminMode(false);
    showMessage('Admin mode deactivated', 'info');
  }

  return (
    <>
      <SiteHeader currentRoute={currentRoute} />
      <main className={currentRoute === forumRoute ? 'container react-container' : 'container react-container portal-container'} id="mainContent">
        {currentRoute === forumRoute ? (
          <>
        <section className="forum-section" id="forumSection" ref={forumRef}>
          <ForumHeader
            isAdminMode={isAdminMode}
            onOpenAdmin={() => setAdminModalOpen(true)}
            onLogout={disableAdminMode}
            onClean={async () => {
              if (!window.confirm('¿Limpiar registros huérfanos?')) return;
              try {
                showMessage('Limpiando...', 'info');
                const result = await cleanOrphanRecords();
                showMessage(`Limpieza completa. ${result?.deleted || 0} registros eliminados.`, 'success');
                if (result?.deleted > 0) await loadPublications();
              } catch (error) {
                showMessage(`Error clearing: ${error.message}`, 'error');
              }
            }}
          />
          <div className="search-container">
            <input
              type="search"
              name="publication-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name..."
              className="search-input"
              aria-label="Search publications by student name"
              autoComplete="off"
            />
          </div>
          <PublicationList
            loading={loading}
            publications={visiblePublications}
            isAdminMode={isAdminMode}
            showMessage={showMessage}
            onChanged={loadPublications}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          />
            </section>
            <UploadSection onSubmitted={handleSubmitted} showMessage={showMessage} status={status} />
          </>
        ) : (
          <PortalPage route={currentRoute} isAdminMode={isAdminMode} showMessage={showMessage} />
        )}
      </main>
      <AdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onValidated={() => {
          enableAdminMode();
          setAdminModalOpen(false);
          showMessage('Admin access granted', 'success');
        }}
      />
    </>
  );
}



function UploadSection({ onSubmitted, showMessage, status }) {
  const [studentName, setStudentName] = useState('');
  const [experience, setExperience] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { studentName, experience };
      if (audioFile) {
        showMessage('Processing audio...', 'info');
        payload.audioFile = await fileToBase64(audioFile);
      }
      if (videoFile) {
        showMessage('Processing video...', 'info');
        payload.videoFile = await fileToBase64(videoFile);
      }
      showMessage('Submitting experience...', 'info');
      await submitExperience(payload);
      showMessage('Experience shared successfully!', 'success');
      setStudentName('');
      setExperience('');
      setAudioFile(null);
      setVideoFile(null);
      await onSubmitted();
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="upload-section">
      <div className="header">
        <Icon path={icons.users} className="icon-header" />
        <h1>Share Your English Experience</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="form-group">
          <textarea
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            placeholder="Tell us about your English learning experience, achievements, or favorite moments..."
            rows="5"
            required
          />
        </div>
        <FilePicker
          type="audio"
          label="Audio Recording (optional - max 10MB)"
          accept="audio/*"
          file={audioFile}
          maxSize={MAX_AUDIO_SIZE}
          onChange={setAudioFile}
          showMessage={showMessage}
        />
        <FilePicker
          type="video"
          label="Video Recording (optional - max 30MB)"
          accept="video/*"
          file={videoFile}
          maxSize={MAX_VIDEO_SIZE}
          onChange={setVideoFile}
          showMessage={showMessage}
        />
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? <div className="spinner spinner-inline" /> : <Icon path={icons.upload} className="icon-btn" />}
          {submitting ? 'Uploading...' : 'Share Your Experience'}
        </button>
      </form>
      {status && <div className={`status-message ${status.type} show`}>{status.message}</div>}
    </section>
  );
}

function FilePicker({ type, label, accept, file, maxSize, onChange, showMessage }) {
  const inputRef = useRef(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectFile(nextFile) {
    if (!nextFile) return;
    if (nextFile.size > maxSize) {
      showMessage(`Archivo muy grande. Máximo: ${formatFileSize(maxSize)}`, 'error');
      return;
    }
    onChange(nextFile);
  }

  return (
    <div className="form-group">
      <label className="file-label">
        <Icon path={type === 'audio' ? icons.microphone : icons.video} className="icon-label" />
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="file-input"
        onChange={(event) => selectFile(event.target.files[0])}
      />
      <button
        type="button"
        className={`file-upload-area ${file ? 'has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <Icon path={icons.file} className="upload-icon" />
        <span className="upload-text">
          {file ? `${file.name} (${formatFileSize(file.size)})` : `Click here to select ${type} file`}
        </span>
        <span className="upload-hint">
          {type === 'audio' ? 'Formats: MP3, WAV, M4A (max 10MB)' : 'Formats: MP4, MOV, AVI (max 30MB)'}
        </span>
      </button>
      {file && (
        <div className="media-preview show">
          <div className="preview-header">
            <Icon path={type === 'audio' ? icons.microphone : icons.video} className="icon-preview" />
            <strong>{type === 'audio' ? 'Audio Preview' : 'Video Preview'}</strong>
          </div>
          {type === 'audio' ? <audio controls src={previewUrl} /> : <video controls src={previewUrl} />}
          <button type="button" className="remove-file-btn" onClick={() => onChange(null)}>
            <Icon path={icons.close} className="icon-remove" />
            Remove {type === 'audio' ? 'Audio' : 'Video'}
          </button>
        </div>
      )}
    </div>
  );
}

function ForumHeader({ isAdminMode, onOpenAdmin, onLogout, onClean }) {
  return (
    <>
      <div className="forum-header">
        <div className="forum-title-container">
          <Icon path={icons.chat} className="icon-forum" />
          <h2>Shared Experiences</h2>
        </div>
        <div className="forum-controls">
          {!isAdminMode && (
            <button type="button" className="admin-btn" onClick={onOpenAdmin} title="Admin Access">
              <Icon path={icons.lock} />
              Admin
            </button>
          )}
          {isAdminMode && (
            <button type="button" className="admin-btn" onClick={onClean} title="Clean Orphan Records">
              Clean
            </button>
          )}
        </div>
      </div>
      {isAdminMode && (
        <div className="admin-banner">
          <div className="admin-banner-content">
            <Icon path={icons.shield} className="icon-admin-banner" />
            <span>Administrator Mode Active</span>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            <Icon path={icons.logout} />
            Logout
          </button>
        </div>
      )}
    </>
  );
}

function PublicationList({ loading, publications, isAdminMode, showMessage, onChanged }) {
  if (loading) {
    return (
      <div className="experiences-container">
        <div className="loading-spinner">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
          </svg>
          <p>Loading experiences...</p>
        </div>
      </div>
    );
  }

  if (publications.length === 0) {
    return (
      <div className="experiences-container">
        <div className="empty-state react-empty-state">
          <Icon path={icons.empty} className="icon-empty" />
          <h3>No Publications Yet</h3>
          <p>Be the first to share your English learning experience!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="experiences-container">
      {publications.map((publication) => (
        <PublicationCard
          key={publication.id}
          publication={publication}
          isAdminMode={isAdminMode}
          showMessage={showMessage}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

function PublicationCard({ publication, isAdminMode, showMessage, onChanged }) {
  async function handleDelete() {
    if (!isAdminMode || !window.confirm('Delete this publication? This cannot be undone.')) return;
    try {
      showMessage('Deleting...', 'info');
      await deleteExperience(publication.id);
      showMessage('Publication deleted', 'success');
      await onChanged();
    } catch (error) {
      showMessage(`Error deleting: ${error.message}`, 'error');
    }
  }

  return (
    <article className="publication-card" data-id={publication.id}>
      <div className="publication-header">
        <div className="student-info">
          <div className="student-avatar">
            <Icon path={icons.user} className="icon-avatar" />
          </div>
          <div className="student-details">
            <h3 className="student-name">{publication.studentName}</h3>
            <p className="publication-date">
              <Icon path={icons.calendar} className="icon-inline" />
              {formatDate(publication.timestamp)}
            </p>
          </div>
        </div>
        {isAdminMode && (
          <div className="publication-actions">
            <button className="delete-btn" onClick={handleDelete} title="Delete" type="button">
              <Icon path={icons.trash} />
            </button>
            {publication.folderUrl && (
              <button className="folder-btn" onClick={() => window.open(publication.folderUrl, '_blank')} title="Ver archivos" type="button">
                <Icon path={icons.folder} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="publication-content">
        <div className="experience-text">
          <Icon path={icons.chat} className="icon-content" />
          <p>{publication.experience}</p>
        </div>
        <MediaLinks publication={publication} />
      </div>
      <div className="publication-footer">
        <div className="publication-stats">
          <span className="stat-item">
            <Icon path="M7 4v16M17 4v16" className="icon-inline" />
            ID: {getPublicationSuffix(publication.id)}
          </span>
          {(publication.mediaInfo?.hasAudio || publication.mediaInfo?.hasVideo) && (
            <span className="stat-item">
              <Icon path="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" className="icon-inline" />
              Media:
              {publication.mediaInfo?.hasAudio && <Icon path={icons.microphone} className="icon-inline-small" />}
              {publication.mediaInfo?.hasVideo && <Icon path={icons.video} className="icon-inline-small" />}
            </span>
          )}
        </div>
        {publication.documentUrl && (
          <div className="publication-links">
            <a href={publication.documentUrl} target="_blank" rel="noreferrer" className="link-btn" title="Ver documento">
              <Icon path={icons.document} />
              Documento
            </a>
          </div>
        )}
      </div>
      <CommentsSection publicationId={publication.id} isAdminMode={isAdminMode} showMessage={showMessage} />
    </article>
  );
}

function MediaLinks({ publication }) {
  if (!publication.audioUrl && !publication.videoUrl) return null;
  return (
    <div className="media-section">
      {publication.audioUrl && (
        <MediaLink
          href={publication.audioUrl}
          type="audio"
          title="Audio Recording"
          filename={publication.mediaInfo?.audioFileName || 'Click to open audio file'}
        />
      )}
      {publication.videoUrl && (
        <MediaLink
          href={publication.videoUrl}
          type="video"
          title="Video Recording"
          filename={publication.mediaInfo?.videoFileName || 'Click to open video file'}
        />
      )}
    </div>
  );
}

function MediaLink({ href, type, title, filename }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`media-link ${type}-link`}>
      <div className="media-link-icon">
        <Icon path={type === 'audio' ? icons.microphone : icons.video} className="icon-media-link" />
      </div>
      <div className="media-link-content">
        <strong className="media-link-title">{title}</strong>
        <span className="media-link-filename">{filename}</span>
      </div>
      <div className="media-link-arrow">
        <Icon path={icons.external} className="icon-arrow" />
      </div>
    </a>
  );
}

function CommentsSection({ publicationId, isAdminMode, showMessage }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshComments = useCallback(async () => {
    setLoading(true);
    try {
      setComments(await getComments(publicationId));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [publicationId]);

  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  return (
    <div className="comments-section" data-pub-id={publicationId}>
      <button className="comments-toggle" onClick={() => setOpen((value) => !value)} type="button">
        <div className="comments-toggle-header">
          <Icon path={icons.chat} className="icon-comments" />
          <h4>Comments</h4>
          {comments.length > 0 && <span className="comments-count react-comments-count">{comments.length}</span>}
        </div>
        <Icon path={icons.chevron} className={`icon-chevron ${open ? 'react-chevron-open' : ''}`} />
      </button>
      {open && (
        <div className="comments-content">
          <CommentForm publicationId={publicationId} showMessage={showMessage} onSubmitted={refreshComments} />
          <div className="comments-list">
            {loading ? (
              <div className="loading-comments">Loading comments...</div>
            ) : (
              <CommentsList
                comments={comments}
                publicationId={publicationId}
                isAdminMode={isAdminMode}
                showMessage={showMessage}
                onChanged={refreshComments}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentForm({ publicationId, showMessage, onSubmitted }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await submitComment({ publicationId, name: name.trim(), comment: comment.trim() });
      setName('');
      setComment('');
      showMessage('Comment posted', 'success');
      await onSubmitted();
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="comment-name-input"
        placeholder="Your name"
        maxLength="50"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <textarea
        className="comment-text-input"
        placeholder="Write your comment (max 500 characters)..."
        rows="3"
        maxLength="500"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        required
      />
      <div className="comment-form-footer">
        <span className={`char-counter ${comment.length > 450 ? 'react-counter-danger' : ''}`}>{comment.length}/500</span>
        <button type="submit" className="comment-submit-btn" disabled={submitting}>
          <Icon path={icons.send} className="icon-send" style={{ transform: 'rotate(90deg)' }} />
          {submitting ? 'Sending...' : 'Comment'}
        </button>
      </div>
    </form>
  );
}

function CommentsList({ comments, publicationId, isAdminMode, showMessage, onChanged }) {
  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <Icon path={icons.chat} className="icon-no-comments" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return comments.map((comment) => (
    <div className="comment-item" key={comment.id}>
      <div className="comment-header">
        <div className="comment-author">
          <Icon path={icons.user} className="icon-user-comment" />
          <strong>{comment.name}</strong>
        </div>
        <div className="comment-meta">
          <span className="comment-date">{formatDate(comment.timestamp)}</span>
          {isAdminMode && (
            <button
              className="comment-delete-btn"
              onClick={async () => {
                if (!window.confirm('Delete this comment?')) return;
                try {
                  await deleteComment({ publicationId, commentId: comment.id });
                  showMessage('Comment deleted', 'success');
                  await onChanged();
                } catch (error) {
                  showMessage(`Error: ${error.message}`, 'error');
                }
              }}
              title="Delete comment"
              type="button"
            >
              <Icon path={icons.trash} className="icon-delete-small" />
            </button>
          )}
        </div>
      </div>
      <p className="comment-text">{comment.comment}</p>
    </div>
  ));
}

function Pagination({ currentPage, totalPages, onPrevious, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button type="button" className="pagination-btn" onClick={onPrevious} disabled={currentPage <= 1}>
        <Icon path={icons.prev} />
        Previous
      </button>
      <span className="pagination-info">Página {currentPage} de {totalPages}</span>
      <button type="button" className="pagination-btn" onClick={onNext} disabled={currentPage >= totalPages}>
        Next
        <Icon path={icons.next} />
      </button>
    </div>
  );
}

function AdminModal({ open, onClose, onValidated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
    }
  }, [open]);

  async function handleLogin() {
    if (!password.trim()) {
      setError('Ingresa la contraseña');
      return;
    }
    try {
      setValidating(true);
      const valid = await validateAdmin(password.trim());
      if (valid) {
        onValidated();
      } else {
        setError('Contraseña inválida');
      }
    } catch {
      setError('Error validando contraseña');
    } finally {
      setValidating(false);
    }
  }

  if (!open) return null;
  return (
    <div className="modal react-modal-open" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <Icon path={icons.lock} className="icon-modal" />
          <h3>Administrator Login</h3>
        </div>
        <p className="modal-description">Enter the administrator password to access management features</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
          placeholder="Enter password"
          className="modal-input"
          autoFocus
        />
        {error && <div className="modal-error react-modal-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="modal-btn modal-btn-confirm" onClick={handleLogin} disabled={validating}>
            {validating ? 'Validando...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
