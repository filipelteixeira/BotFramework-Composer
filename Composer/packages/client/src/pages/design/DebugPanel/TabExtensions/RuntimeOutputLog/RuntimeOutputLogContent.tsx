// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, runtimeLogsState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import { DebugPanelTabHeaderProps } from '../types';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

export const RuntimeOutputLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const logs = useRecoilValue(runtimeLogsState(currentProjectId ?? ''));
  console.log('%s', logs);

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
      <span>{logs}</span>
    </div>
  );
};
