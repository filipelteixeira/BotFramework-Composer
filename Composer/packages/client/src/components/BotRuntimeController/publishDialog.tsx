// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, Fragment } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { IConfig, IPublishConfig, IQnAConfig } from '@bfc/shared';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

import { Text, Tips, Links, nameRegex, LUIS_REGIONS } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { getReferredQnaFiles } from '../../utils/qnaUtil';
import { getLuisBuildLuFiles } from '../../utils/luUtil';
import { luFilesSelectorFamily, qnaFilesSelectorFamily, dialogsSelectorFamily } from '../../recoilModel';

// -------------------- Styles -------------------- //
const textFieldLabel = css`
  font-weight: ${FontWeights.semibold};
`;

const dialogSubTitle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
`;

const dialogContent = css`
  margin-top: 20px;
  margin-bottom: 50px;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

const dialogModal = {
  main: {
    maxWidth: '450px !important',
  },
};
interface FormData {
  name: string;
  authoringKey: string;
  subscriptionKey?: string;
  qnaRegion?: string;
  endpointKey: string;
  authoringRegion: string;
  defaultLanguage: string;
  environment: string;
  endpoint: string;
  authoringEndpoint: string;
}

const validate = (value?: string) => {
  if (value != null && !nameRegex.test(value)) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
};

// eslint-disable-next-line react/display-name
const onRenderLabel = (info: string) => (props?: ITextFieldProps) => (
  <Stack horizontal verticalAlign="center">
    <span css={textFieldLabel}>{props?.label}</span>
    <TooltipHost calloutProps={{ gapSpace: 0 }} content={info}>
      <IconButton iconProps={{ iconName: 'Info' }} styles={{ root: { marginBottom: -3 } }} />
    </TooltipHost>
  </Stack>
);

interface IPublishDialogProps {
  botName: string;
  isOpen: boolean;
  config: IConfig;
  onDismiss: () => void;
  onPublish: (data: IPublishConfig) => void;
  projectId: string;
}

export const PublishDialog: React.FC<IPublishDialogProps> = (props) => {
  const { isOpen, onDismiss, onPublish, botName, config, projectId } = props;
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const qnaConfigShow = getReferredQnaFiles(qnaFiles, dialogs).length > 0;
  const luConfigShow = getLuisBuildLuFiles(luFiles, dialogs).length > 0;

  const formConfig: FieldConfig<FormData> = {
    name: {
      required: true,
      validate,
      defaultValue: config.name || botName,
    },
    authoringKey: {
      required: luConfigShow,
      validate,
      defaultValue: config.authoringKey,
    },
    subscriptionKey: {
      required: qnaConfigShow,
      validate,
      defaultValue: config.subscriptionKey,
    },
    qnaRegion: {
      required: true,
      defaultValue: config.qnaRegion || 'westus',
    },
    endpointKey: {
      required: false,
      defaultValue: config.endpointKey,
    },
    authoringRegion: {
      required: true,
      defaultValue: config.authoringRegion || 'westus',
    },
    defaultLanguage: {
      required: true,
      defaultValue: config.defaultLanguage || 'en-us',
    },
    environment: {
      required: true,
      validate,
      defaultValue: config.environment,
    },
    endpoint: {
      required: false,
      defaultValue: config.endpoint,
    },
    authoringEndpoint: {
      required: false,
      defaultValue: config.authoringEndpoint,
    },
  };

  const { formData, formErrors, hasErrors, updateField } = useForm(formConfig, { validateOnMount: true });

  const handlePublish = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }
      const newValue = Object.assign({}, formData);
      const subscriptionKey = formData.subscriptionKey;
      const qnaRegion = formData.qnaRegion;
      delete newValue.subscriptionKey;
      delete newValue.qnaRegion;
      const publishConfig: IPublishConfig = {
        luis: newValue,
        qna: {
          subscriptionKey,
          qnaRegion,
          endpointKey: '',
        } as IQnAConfig,
      };
      onPublish(publishConfig);
    },
    [hasErrors, formData]
  );

  const luisTitleRender = () => {
    return (
      <Fragment>
        <br />
        {Text.LUISDEPLOY}
        <Link href={Links.LUIS} target="_blank">
          {formatMessage('Learn more.')}
        </Link>
      </Fragment>
    );
  };

  const qnaTitleRender = () => {
    return (
      <Fragment>
        <br />
        {Text.QNADEPLOY}
        <Link href={Links.QNA} target="_blank">
          {formatMessage('Learn more.')}
        </Link>
      </Fragment>
    );
  };
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish models'),
        styles: dialog,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        isModeless: true,
        styles: dialogModal,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogSubTitle}>
        {Text.DEPLOY}
        {luConfigShow ? luisTitleRender() : ''}
        {qnaConfigShow ? qnaTitleRender() : ''}
      </div>
      <form css={dialogContent} onSubmit={handlePublish}>
        <Stack tokens={{ childrenGap: 20 }}>
          <TextField
            data-testid="ProjectNameInput"
            errorMessage={formErrors.name}
            label={formatMessage('What is the name of your bot?')}
            value={formData.name}
            onChange={(_e, val) => updateField('name', val)}
            onRenderLabel={onRenderLabel(Tips.PROJECT_NAME)}
          />
          <TextField
            data-testid="EnvironmentInput"
            errorMessage={formErrors.environment}
            label={formatMessage('Environment')}
            value={formData.environment}
            onChange={(_e, val) => updateField('environment', val)}
            onRenderLabel={onRenderLabel(Tips.ENVIRONMENT)}
          />
          {luConfigShow && (
            <Fragment>
              <TextField
                data-testid="AuthoringKeyInput"
                errorMessage={formErrors.authoringKey}
                label={formatMessage('LUIS Authoring key:')}
                value={formData.authoringKey}
                onChange={(_e, val) => updateField('authoringKey', val)}
                onRenderLabel={onRenderLabel(Tips.AUTHORING_KEY)}
              />
              <Dropdown
                data-testid="regionDropdown"
                label={formatMessage('Luis Authoring Region')}
                options={LUIS_REGIONS}
                responsiveMode={ResponsiveMode.large}
                selectedKey={formData.authoringRegion}
                onChange={(_e, option) => {
                  if (option) {
                    updateField('authoringRegion', option.key.toString());
                  }
                }}
              />
            </Fragment>
          )}
          {qnaConfigShow && (
            <Fragment>
              <TextField
                data-testid="SubscriptionKeyInput"
                errorMessage={formErrors.subscriptionKey}
                label={formatMessage('QNA Subscription key:')}
                value={formData.subscriptionKey}
                onChange={(_e, val) => updateField('subscriptionKey', val)}
                onRenderLabel={onRenderLabel(Tips.SUBSCRIPTION_KEY)}
              />
              <TextField
                disabled
                readOnly
                errorMessage={formErrors.qnaRegion}
                label={formatMessage('QnA Region')}
                value={formData.qnaRegion}
                onRenderLabel={onRenderLabel(Tips.AUTHORING_REGION)}
              />
            </Fragment>
          )}
          <TextField
            disabled
            readOnly
            errorMessage={formErrors.defaultLanguage}
            label={formatMessage('Default Language')}
            value={formData.defaultLanguage}
            onRenderLabel={onRenderLabel(Tips.DEFAULT_LANGUAGE)}
          />
        </Stack>
      </form>
      <DialogFooter>
        <PrimaryButton disabled={hasErrors} text={formatMessage('OK')} onClick={handlePublish} />
        <DefaultButton data-testid={'publish-LUIS-models-cancel'} text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
