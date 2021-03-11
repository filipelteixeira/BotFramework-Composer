// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';

import { botRuntimeErrorState, rootBotProjectIdSelector, botRuntimeLogsState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import { DebugPanelTabHeaderProps } from '../types';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

export const RuntimeOutputLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const logs = useRecoilValue(botRuntimeLogsState(currentProjectId ?? ''));
  const botRuntimeErrors = useRecoilValue(botRuntimeErrorState(currentProjectId ?? ''));

  return (
    <div
      css={{
        height: 'calc(100% - 20px)',
        display: !isActive ? 'none' : 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        padding: '16px 24px',
        fontSize: DEFAULT_FONT_SETTINGS.fontSize,
        fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
        color: `${NeutralColors.black}`,
      }}
      data-testid="Runtime-Output-Logs"
    >
      <p
        css={{
          whiteSpace: 'pre-wrap',
          lineHeight: '20px',
          margin: 0,
        }}
      >
        {logs}
      </p>

      <p
        css={{
          whiteSpace: 'pre-wrap',
          lineHeight: '20px',
          margin: 0,
        }}
      >
        {logs}
      </p>
      {botRuntimeErrors.message && (
        <Fragment>
          <p
            css={{
              color: `${SharedColors.red10}`,
              whiteSpace: 'pre-wrap',
              lineHeight: '20px',
            }}
          >
            {botRuntimeErrors.message}
          </p>
        </Fragment>
      )}
    </div>
  );
};
