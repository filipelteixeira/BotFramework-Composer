// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useRef, Fragment } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { CreationFlowStatus, firstPartyTemplateFeed } from '../../constants';
import {
  dispatcherState,
  creationFlowStatusState,
  storagesState,
  focusedStorageFolderState,
  currentProjectIdState,
  userSettingsState,
  templateProjectsState,
} from '../../recoilModel';
import Home from '../../pages/home/Home';
import { useProjectIdCache } from '../../utils/hooks';
import { ImportModal } from '../ImportModal/ImportModal';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { CreateOptions } from './CreateOptions';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = (props: CreationFlowProps) => {
  const {
    fetchTemplatesV2,
    fetchRecentProjects,
    fetchFeed,
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    openProject,
    createNewBot,
    saveProjectAs,
    fetchProjectById,
    createNewBotV2,
  } = useRecoilValue(dispatcherState);

  const templateProjects = useRecoilValue(templateProjectsState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const projectId = useRecoilValue(currentProjectIdState);
  const storages = useRecoilValue(storagesState);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
  const { appLocale } = useRecoilValue(userSettingsState);
  const cachedProjectId = useProjectIdCache();
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  useEffect(() => {
    if (storages?.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  const fetchResources = async () => {
    // fetchProject use `gotoSnapshot` which will wipe out all state value.
    // so here make those methods call in sequence.
    if (!projectId && cachedProjectId) {
      await fetchProjectById(cachedProjectId);
    }
    await fetchStorages();
    fetchFeed();
    fetchRecentProjects();
    fetchTemplatesV2([firstPartyTemplateFeed]);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      const formattedPath = Path.normalize(newPath);
      updateCurrentPathForStorage(formattedPath, storageId);
    }
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    navigate(`/home`);
  };

  const handleJumpToOpenModal = (search) => {
    setCreationFlowStatus(CreationFlowStatus.OPEN);
    navigate(`./open${search}`);
  };

  const openBot = async (formData) => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    await openProject(
      formData.path,
      'default',
      true,
      { profile: formData.profile, source: formData.source, alias: formData.alias },
      (projectId) => {
        TelemetryClient.track('BotProjectOpened', { method: 'toolbar', projectId });
      }
    );
  };

  const handleCreateNew = async (formData, templateId: string) => {
    const newBotData = {
      templateId: templateId || '',
      name: formData.name,
      description: formData.description,
      location: formData.location,
      schemaUrl: formData.schemaUrl,
      appLocale,
      templateDir: formData.templateDir,
      eTag: formData.eTag,
      urlSuffix: formData.urlSuffix,
      alias: formData.alias,
      preserveRoot: formData.preserveRoot,
      profile: formData.profile,
      source: formData.source,
    };
    if (templateId === 'conversationalcore') {
      createNewBotV2(newBotData);
    } else {
      createNewBot(newBotData);
    }
  };

  const handleSaveAs = (formData) => {
    saveProjectAs(projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        saveTemplateId(templateId);
        await handleCreateNew(formData, templateId);
    }
  };

  const handleCreateNext = async (data: string) => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`./create/${data}`);
  };

  return (
    <Fragment>
      <Home />
      <Router>
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path="create/:templateId"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
        <CreateOptions
          path="create"
          templates={templateProjects}
          onDismiss={handleDismiss}
          onJumpToOpenModal={handleJumpToOpenModal}
          onNext={handleCreateNext}
        />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
        <OpenProject
          focusedStorageFolder={focusedStorageFolder}
          path="open"
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onOpen={openBot}
        />
        <ImportModal path="import" />
      </Router>
    </Fragment>
  );
};

export default CreationFlow;
