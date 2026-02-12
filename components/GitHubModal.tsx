import React, { useState, useEffect, useMemo } from 'react';
import type { GitHubModalProps, GitHubRepository, GitHubFile } from '../types';

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  repositories,
  selectedRepository,
  currentPath,
  files,
  onRepositorySelect,
  onFileSelect,
  onNavigate,
  isLoading,
  isLoadingFiles,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [repositoryFilter, setRepositoryFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'stars'>('updated');
  const [currentView, setCurrentView] = useState<'repositories' | 'files'>('repositories');

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen && !selectedRepository) {
      setCurrentView('repositories');
    }
  }, [isOpen, selectedRepository]);

  // Switch to files view when repository is selected
  useEffect(() => {
    if (selectedRepository && currentView === 'repositories') {
      setCurrentView('files');
    }
  }, [selectedRepository, currentView]);

  // Filter and sort repositories
  const filteredRepositories = useMemo(() => {
    let filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = repositoryFilter === 'all' ||
                           (repositoryFilter === 'private' && repo.private) ||
                           (repositoryFilter === 'public' && !repo.private);
      return matchesSearch && matchesFilter;
    });

    // Sort repositories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [repositories, searchTerm, repositoryFilter, sortBy]);

  // Filter files to show only markdown files and directories
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      if (file.type === 'dir') return true;
      return file.name.endsWith('.md') || file.name.endsWith('.markdown');
    });
  }, [files]);

  // Handle breadcrumb navigation
  const pathSegments = currentPath.split('/').filter(Boolean);

  const handlePathNavigation = (index: number) => {
    const newPath = pathSegments.slice(0, index + 1).join('/');
    onNavigate(newPath);
  };

  const handleBackToRepositories = () => {
    setCurrentView('repositories');
    onRepositorySelect(null as any); // Reset selected repository
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-app-panel rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-main">
          <div className="flex items-center gap-4">
            {currentView === 'files' && selectedRepository && (
              <button
                onClick={handleBackToRepositories}
                className="p-2 hover:bg-app-hover rounded-lg transition-colors"
                title="Back to repositories"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-bold text-app-main">
              {currentView === 'repositories' ? 'Browse GitHub Repositories' : `${selectedRepository?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-hover rounded-lg transition-colors text-app-muted hover:text-app-main"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Repository View */}
        {currentView === 'repositories' && (
          <>
            {/* Repository Controls */}
            <div className="p-6 border-b border-app-main">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-app-border-muted rounded-lg bg-app-input text-app-main focus:ring-2 focus:ring-[var(--app-accent-main)] focus:border-transparent placeholder:text-app-muted"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={repositoryFilter}
                    onChange={(e) => setRepositoryFilter(e.target.value as 'all' | 'public' | 'private')}
                    className="px-3 py-2 border border-app-border-muted rounded-lg bg-app-input text-app-main focus:ring-2 focus:ring-[var(--app-accent-main)]"
                  >
                    <option value="all">All repositories</option>
                    <option value="public">Public only</option>
                    <option value="private">Private only</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'stars')}
                    className="px-3 py-2 border border-app-border-muted rounded-lg bg-app-input text-app-main focus:ring-2 focus:ring-[var(--app-accent-main)]"
                  >
                    <option value="updated">Recently updated</option>
                    <option value="name">Name</option>
                    <option value="stars">Stars</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Repository List */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="flex items-center gap-2 text-app-muted">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading repositories...
                  </div>
                </div>
              ) : filteredRepositories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRepositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => onRepositorySelect(repo)}
                      className="text-left p-4 border border-app-border-muted rounded-lg hover:border-app-accent-main hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-app-main group-hover:text-app-accent truncate">
                          {repo.name}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          {repo.private && (
                            <svg className="w-4 h-4 text-app-muted" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {repo.language && (
                            <span className="text-xs px-2 py-1 bg-app-hover rounded-full text-app-muted">
                              {repo.language}
                            </span>
                          )}
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-sm text-app-muted mb-3 line-clamp-2">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-app-muted">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          {repo.forks_count}
                        </div>
                        <span>Updated {formatDate(repo.updated_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h8" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-app-main">No repositories found</h3>
                  <p className="mt-1 text-sm text-app-muted">
                    {searchTerm ? 'Try adjusting your search terms' : 'No repositories match your filters'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Files View */}
        {currentView === 'files' && selectedRepository && (
          <>
            {/* Breadcrumb */}
            <div className="px-6 py-4 border-b border-app-main">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => onNavigate('')}
                  className="text-app-accent hover:opacity-80"
                >
                  {selectedRepository.name}
                </button>
                {pathSegments.map((segment, index) => (
                  <React.Fragment key={index}>
                    <span className="text-app-muted">/</span>
                    <button
                      onClick={() => handlePathNavigation(index)}
                      className="text-app-accent hover:opacity-80"
                    >
                      {segment}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-auto">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center h-48">
                  <div className="flex items-center gap-2 text-app-muted">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading files...
                  </div>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="divide-y divide-app-main">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => {
                        if (file.type === 'dir') {
                          onNavigate(file.path);
                        } else {
                          onFileSelect(file);
                        }
                      }}
                      className="w-full text-left px-6 py-3 hover:bg-app-hover transition-colors flex items-center gap-3"
                    >
                      {/* File/Folder Icon */}
                      {file.type === 'dir' ? (
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-app-main truncate">
                          {file.name}
                        </p>
                        {file.type === 'file' && (
                          <p className="text-sm text-app-muted">
                            {formatFileSize(file.size)}
                          </p>
                        )}
                      </div>

                      {/* Navigation Arrow */}
                      <svg className="w-5 h-5 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-app-main">No markdown files found</h3>
                  <p className="mt-1 text-sm text-app-muted">
                    This directory doesn't contain any .md files
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
