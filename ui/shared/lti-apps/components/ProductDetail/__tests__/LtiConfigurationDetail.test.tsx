/*
 * Copyright (C) 2024 - present Instructure, Inc.
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

import React from 'react'
import {render} from '@testing-library/react'
import LtiConfigurationDetail from '../LtiConfigurationDetail'
import {canvas_lti_configurations} from '../../common/__tests__/data'

describe('LtiConfigurationDetail renders as expected', () => {
  it('Component renders as expected', () => {
    const {getByText} = render(
      <LtiConfigurationDetail integrationData={canvas_lti_configurations[0]} />
    )
    expect(getByText('great product!')).toBeInTheDocument()
    expect(getByText('this is a piece of placement data')).toBeInTheDocument()
    expect(getByText('this is a piece of service data')).toBeInTheDocument()
  })
})
