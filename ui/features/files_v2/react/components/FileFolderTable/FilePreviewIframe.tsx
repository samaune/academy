/*
 * Copyright (C) 2025 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";
import {useScope as createI18nScope} from '@canvas/i18n'
import type {File} from "../../../interfaces/File";

const I18n = createI18nScope('files_v2')

const FilePreviewIframe = ({item}: {item: File}) => (
  <iframe
    sandbox={
      item.mime_class == 'html'
        ? 'allow-same-origin'
        : 'allow-scripts allow-same-origin'
    }
    src={item.preview_url}
    style={{
      ...(item.mime_class === 'html' ? { backgroundColor: '#f5f5f5' } : {}),
      border: 'none',
      display: 'block',
      height: '100%',
      width: '100%',
    }}
    title={I18n.t('Preview for file: %{name}', {
      name: item.display_name
    })}
  />
)

export default FilePreviewIframe
