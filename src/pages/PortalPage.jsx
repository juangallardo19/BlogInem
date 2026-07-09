import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteBloggingContentBatch,
  getBloggingContent,
  initializeBloggingFolders,
  scanBloggingUploads,
  uploadBloggingContentBatch
} from '../api.js';
import { forumRoute, getPageByRoute, portalSections } from '../data/portalSections.js';
import { Icon, icons } from '../icons.jsx';
import { fileToBase64, formatFileSize, MAX_VIDEO_SIZE } from '../utils.js';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const contentTypeLabels = {
  photo: 'Photos',
  miniblog: 'Mini Blogs',
  roleplay: 'Roleplays',
  video: 'Videos'
};

const contentCardLabels = {
  photo: 'Photo',
  miniblog: 'Mini Blog',
  roleplay: 'Roleplay',
  video: 'Video'
};

const contentTypeByRoute = [
  ['photos', 'photo'],
  ['videos', 'video'],
  ['miniblogs', 'miniblog'],
  ['roleplays', 'roleplay']
];

function getSectionByPage(page) {
  if (page.type === 'section') return portalSections.find((section) => section.id === page.id);
  return portalSections.find((section) => section.label === page.parentLabel);
}

function getContentTypeFromRoute(route) {
  const routeMatch = contentTypeByRoute.find(([routePart]) => route.includes(routePart));
  return routeMatch ? routeMatch[1] : '';
}

function getAllowedTypes(section) {
  if (!section) return ['video'];
  if (section.id === 'introduction' || section.id === 'evaluation') return ['video'];
  return ['photo', 'miniblog', 'roleplay', 'video'];
}

function getFolderForPage(structure, sectionId, contentType) {
  if (!structure?.folders) return null;
  return structure.folders.find((folder) => {
    if (folder.section !== sectionId) return false;
    return contentType ? folder.contentType === contentType : true;
  });
}

export function PortalPage({ route, isAdminMode, showMessage }) {
  const page = getPageByRoute(route);
  const section = page ? getSectionByPage(page) : null;
  const routeContentType = page ? getContentTypeFromRoute(page.route) : '';
  const allowedTypes = useMemo(() => getAllowedTypes(section), [section]);
  const [content, setContent] = useState([]);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminBusy, setAdminBusy] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const contentRequestRef = useRef(0);

  const loadContent = useCallback(async () => {
    if (!section) return;
    const requestId = contentRequestRef.current + 1;
    contentRequestRef.current = requestId;
    const isStale = () => contentRequestRef.current !== requestId;
    setLoading(true);
    try {
      console.debug('[Portal content] loading', {
        route,
        section: section.id,
        contentType: routeContentType,
        admin: isAdminMode
      });
      const items = await getBloggingContent({
        section: section.id,
        contentType: routeContentType,
        admin: isAdminMode,
        sync: false
      });
      if (isStale()) return;
      console.debug('[Portal content] loaded', {
        route,
        section: section.id,
        contentType: routeContentType,
        count: items.length,
        items
      });
      setContent(items);
      setSelectedContentIds((ids) => ids.filter((id) => items.some((item) => item.id === id)));
      setLoading(false);
    } catch (error) {
      if (isStale()) return;
      setContent([]);
      showMessage?.(`Error loading section content: ${error.message}`, 'error');
      setLoading(false);
    }
  }, [isAdminMode, route, routeContentType, section, showMessage]);

  const loadStructure = useCallback(async () => {
    if (!isAdminMode) {
      setStructure(null);
      return;
    }
    try {
      setStructure(await initializeBloggingFolders());
    } catch (error) {
      showMessage?.(`Error preparing Drive folders: ${error.message}`, 'error');
    }
  }, [isAdminMode, showMessage]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    loadStructure();
  }, [loadStructure]);

  if (!page) {
    return (
      <section className="portal-page">
        <p className="portal-eyebrow">Portal</p>
        <h1>Page Not Found</h1>
        <p>The requested section is not available yet.</p>
        <a className="portal-action" href={`#/${forumRoute}`}>Back to Blog</a>
      </section>
    );
  }

  return (
    <section className={`portal-page portal-page-${page.id}`}>
      <p className="portal-eyebrow">{page.parentLabel || 'Learning Section'}</p>
      <h1>{page.label}</h1>

      {page.type === 'section' && (
        <div className="portal-subsections" aria-label={`${page.label} pages`}>
          {page.items.map((item) => (
            <a className="portal-subsection-link" href={`#/${item.route}`} key={item.id}>
              {item.label}
            </a>
          ))}
        </div>
      )}

      {isAdminMode && (
        <BloggingAdminPanel
          page={page}
          section={section}
          routeContentType={routeContentType}
          allowedTypes={allowedTypes}
          structure={structure}
          onStructureChanged={loadStructure}
          onContentChanged={loadContent}
          busy={adminBusy}
          setBusy={setAdminBusy}
          showMessage={showMessage}
        />
      )}

      <ContentGallery
        loading={loading}
        content={content}
        page={page}
        contentType={routeContentType}
        isAdminMode={isAdminMode}
        selectedIds={selectedContentIds}
        onToggleSelected={(id) => {
          setSelectedContentIds((ids) => (ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id]));
        }}
        onSelectAll={() => setSelectedContentIds(content.map((item) => item.id))}
        onClearSelection={() => setSelectedContentIds([])}
        onDeleteSelected={async () => {
          if (selectedContentIds.length === 0) return;
          if (!window.confirm(`Delete ${selectedContentIds.length} selected item(s)? This will also move the Drive files to trash.`)) return;
          setAdminBusy(true);
          try {
            const result = await deleteBloggingContentBatch(selectedContentIds);
            showMessage?.(`${result.deletedCount || 0} item(s) deleted`, 'success');
            setSelectedContentIds([]);
            await loadContent();
          } catch (error) {
            showMessage?.(`Error deleting selected content: ${error.message}`, 'error');
          } finally {
            setAdminBusy(false);
          }
        }}
        busy={adminBusy}
      />
    </section>
  );
}

function BloggingAdminPanel({
  page,
  section,
  routeContentType,
  allowedTypes,
  structure,
  onStructureChanged,
  onContentChanged,
  busy,
  setBusy,
  showMessage
}) {
  const initialType = routeContentType || allowedTypes[0] || 'video';
  const [selectedType, setSelectedType] = useState(initialType);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const folder = getFolderForPage(structure, section.id, routeContentType || selectedType);
  const uploadLimit = selectedType === 'photo' ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE;

  useEffect(() => {
    setSelectedType(initialType);
    setFiles([]);
  }, [initialType]);

  async function runAdminAction(action, successMessage) {
    setBusy(true);
    try {
      await action();
      showMessage?.(successMessage, 'success');
      await onStructureChanged();
      await onContentChanged();
    } catch (error) {
      showMessage?.(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload() {
    if (files.length === 0) {
      showMessage?.('Select at least one file', 'error');
      return;
    }

    const oversized = files.find((file) => file.size > uploadLimit);
    if (oversized) {
      showMessage?.(`${oversized.name} is too large. Limit: ${formatFileSize(uploadLimit)}`, 'error');
      return;
    }

    setUploading(true);
    await runAdminAction(async () => {
      showMessage?.('Uploading selected files. Small Drive uploads can take a moment...', 'info');
      const payloadFiles = await Promise.all(files.map((file) => fileToBase64(file)));
      await uploadBloggingContentBatch({
        section: section.id,
        contentType: selectedType,
        files: payloadFiles
      });
      console.debug('[Portal content] upload finished', {
        section: section.id,
        contentType: selectedType,
        fileCount: payloadFiles.length
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showMessage?.('Upload completed successfully', 'success');
    }, 'Content uploaded');
    setUploading(false);
  }

  return (
    <div className="portal-admin-panel">
      <div className="portal-admin-header">
        <div>
          <strong>Content Manager</strong>
          <span>Upload small files here, or open Drive for large videos. Videos up to {formatFileSize(MAX_VIDEO_SIZE)}, photos up to {formatFileSize(MAX_PHOTO_SIZE)}.</span>
        </div>
        <div className="portal-admin-actions">
          {structure?.pendingFolderUrl && (
            <a className="portal-admin-btn" href={structure.pendingFolderUrl} target="_blank" rel="noreferrer">
              <Icon path={icons.external} />
              Pending folder
            </a>
          )}
          {folder?.folderUrl && (
            <a className="portal-admin-btn" href={folder.folderUrl} target="_blank" rel="noreferrer">
              <Icon path={icons.folder} />
              View folder
            </a>
          )}
          <button
            type="button"
            className="portal-admin-btn"
            disabled={busy}
            onClick={() => runAdminAction(scanBloggingUploads, 'Pending Drive uploads scanned')}
          >
            <Icon path={icons.file} />
            Scan Drive
          </button>
        </div>
      </div>

      <div className="portal-admin-upload">
        <label>
          Content type
          <select
            value={selectedType}
            onChange={(event) => {
              setSelectedType(event.target.value);
              setFiles([]);
            }}
            disabled={Boolean(routeContentType) || busy || uploading}
          >
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {contentTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="portal-admin-file">
          Upload files
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={selectedType === 'photo' ? 'image/*' : selectedType === 'video' ? 'video/*' : '*/*'}
            disabled={busy || uploading}
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
          <button type="button" className="portal-file-picker-btn" disabled={busy || uploading} onClick={() => fileInputRef.current?.click()}>
            <Icon path={icons.upload} />
            Select files
          </button>
        </label>
        <button type="button" className="portal-admin-btn portal-admin-primary" disabled={busy || uploading || files.length === 0} onClick={handleUpload}>
          {uploading ? <span className="portal-mini-spinner" /> : <Icon path={icons.upload} />}
          {uploading ? 'Uploading...' : 'Upload selected'}
        </button>
      </div>

      {files.length > 0 && (
        <div className="portal-admin-selected">
          {files.map((file) => (
            <span key={`${file.name}-${file.size}`}>{file.name} ({formatFileSize(file.size)})</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentGallery({
  loading,
  content,
  page,
  contentType,
  isAdminMode,
  selectedIds,
  onToggleSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  busy
}) {
  if (loading) {
    return <div className="portal-empty-state">Loading content...</div>;
  }

  if (content.length === 0) {
    return (
      <div className="portal-empty-state">
        {contentType === 'video' ? 'No videos have been uploaded yet.' : 'No content has been uploaded yet.'}
      </div>
    );
  }

  return (
    <>
      {isAdminMode && (
        <div className="portal-selection-bar">
          <span>{selectedIds.length} selected</span>
          <button type="button" className="portal-admin-btn" onClick={onSelectAll} disabled={busy || selectedIds.length === content.length}>
            Select all
          </button>
          <button type="button" className="portal-admin-btn" onClick={onClearSelection} disabled={busy || selectedIds.length === 0}>
            Clear
          </button>
          <button type="button" className="portal-admin-btn portal-admin-danger" onClick={onDeleteSelected} disabled={busy || selectedIds.length === 0}>
            <Icon path={icons.trash} />
            Delete selected
          </button>
        </div>
      )}
      <div className="portal-masonry" aria-label={`${page.label} content`}>
        {content.map((item, index) => (
          <ContentCard
            item={item}
            index={index}
            key={item.id}
            isAdminMode={isAdminMode}
            selected={selectedIds.includes(item.id)}
            onToggleSelected={onToggleSelected}
          />
        ))}
      </div>
    </>
  );
}

function ContentCard({ item, index, isAdminMode, selected, onToggleSelected }) {
  const cardSizes = ['large', 'small', 'medium', 'large', 'medium', 'small', 'large', 'medium', 'small', 'medium', 'large', 'small'];
  const size = cardSizes[index % cardSizes.length];
  const isVideo = item.contentType === 'video';
  const isPhoto = item.contentType === 'photo';

  return (
    <article className={`portal-content-card portal-masonry-${size} ${selected ? 'portal-content-selected' : ''}`}>
      {isAdminMode && (
        <label className="portal-content-check">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelected(item.id)} />
          <span>Select</span>
        </label>
      )}
      <div className="portal-content-media">
        {isVideo ? (
          <a href={item.driveUrl} target="_blank" rel="noreferrer" className="portal-video-link" aria-label={`Open video ${item.title || item.fileName}`}>
            <img src={item.thumbnailUrl || item.downloadUrl} alt={item.title || item.fileName} loading="lazy" />
          </a>
        ) : isPhoto ? (
          <a href={item.driveUrl || item.downloadUrl} target="_blank" rel="noreferrer" className="portal-video-link" aria-label={`Open photo ${item.title || item.fileName}`}>
            <img src={item.thumbnailUrl || item.downloadUrl} alt={item.title || item.fileName} loading="lazy" />
          </a>
        ) : (
          <a href={item.driveUrl} target="_blank" rel="noreferrer" className="portal-document-link">
            <Icon path={icons.document} />
            Open file
          </a>
        )}
      </div>
      <div className="portal-content-overlay">
        <span>{contentCardLabels[item.contentType] || item.contentType}</span>
      </div>
    </article>
  );
}
