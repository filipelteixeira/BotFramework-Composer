// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, Suspense, useCallback, useEffect } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { navigateTo, buildURL } from '../../utils/navigation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Page } from '../../components/Page';
import { localeState, luFilesSelectorFamily } from '../../recoilModel';

import TableView from './table-view';

const CodeEditor = React.lazy(() => import('./code-editor'));

const LUPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId: string;
  luFileId: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId, luFileId = '' } = props;
  const actualProjectId = skillId ?? projectId;
  const locale = useRecoilValue(localeState(actualProjectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(actualProjectId));

  const path = props.location?.pathname ?? '';
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

  const activeFile = luFileId
    ? luFiles.find(({ id }) => id === luFileId || id === `${luFileId}.${locale}`)
    : luFiles.find(({ id }) => id === dialogId || id === `${dialogId}.${locale}`);

  useEffect(() => {
    if (!activeFile && luFiles.length) {
      navigateTo(buildURL('language-understanding', { projectId, skillId }));
    }
  }, [dialogId, luFiles, projectId, luFileId]);

  const onToggleEditMode = useCallback(() => {
    let url = buildURL('language-understanding', { projectId, skillId, dialogId });
    if (luFileId) url += `/item/${luFileId}`;
    if (!edit) url += `/edit`;
    navigateTo(url);
  }, [dialogId, projectId, luFileId, edit]);

  const onRenderHeaderContent = () => {
    if (!isRoot) {
      return (
        <ActionButton data-testid="showcode" onClick={onToggleEditMode}>
          {edit ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      );
    }
    return null;
  };

  return (
    <Page
      useDebugPane
      useNewTree
      data-testid="LUPage"
      dialogId={dialogId}
      fileId={luFileId}
      mainRegionName={formatMessage('LU editor')}
      navRegionName={formatMessage('LU Navigation Pane')}
      pageMode={'language-understanding'}
      projectId={projectId}
      skillId={skillId}
      title={formatMessage('User Input')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor
            dialogId={dialogId}
            file={activeFile}
            luFileId={luFileId}
            path="/edit"
            projectId={projectId}
            skillId={skillId}
          />
          <TableView
            dialogId={dialogId}
            file={activeFile}
            luFileId={luFileId}
            path="/"
            projectId={projectId}
            skillId={skillId}
          />
        </Router>
      </Suspense>
    </Page>
  );
};

export default LUPage;
