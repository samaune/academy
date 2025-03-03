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

import {cleanup, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {MemoryRouter, useNavigate} from 'react-router-dom'
import {NewLoginDataProvider, NewLoginProvider, useNewLoginData} from '../../context'
import {ROUTES} from '../../routes/routes'
import {forgotPassword} from '../../services'
import ForgotPassword from '../ForgotPassword'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

jest.mock('../../context', () => {
  const actualContext = jest.requireActual('../../context')
  return {
    ...actualContext,
    useNewLoginData: jest.fn(() => ({
      ...actualContext.useNewLoginData(),
    })),
  }
})

jest.mock('../../services/auth', () => ({
  forgotPassword: jest.fn(),
}))

describe('ForgotPassword', () => {
  const setup = () => {
    render(
      <MemoryRouter>
        <NewLoginProvider>
          <NewLoginDataProvider>
            <ForgotPassword />
          </NewLoginDataProvider>
        </NewLoginProvider>
      </MemoryRouter>,
    )
  }

  const mockNavigate = jest.fn()
  beforeAll(() => {
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    // reset the mock implementation to return the default values
    ;(useNewLoginData as jest.Mock).mockImplementation(() => ({
      loginHandleName: 'Email',
    }))
    setup()
  })

  afterEach(() => {
    cleanup()
  })

  describe('form validation', () => {
    describe('when required fields are empty', () => {
      it('does not allow the form to submit', async () => {
        const submitButton = screen.getByTestId('submit-button')
        await userEvent.click(submitButton)
        const emailInput = await screen.findByTestId('email-input')
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })

      it('displays a required validation message', async () => {
        const submitButton = screen.getByTestId('submit-button')
        await userEvent.click(submitButton)
        const errorMessage = await screen.findByText('Please enter a valid email.')
        expect(errorMessage).toBeInTheDocument()
      })

      it('renders an asterisk for required fields', async () => {
        const submitButton = screen.getByTestId('submit-button')
        await userEvent.click(submitButton)
        const requiredLabels = screen.getAllByText(/\*$/)
        expect(requiredLabels).toHaveLength(1)
      })

      it('displays the asterisk in red color', async () => {
        const submitButton = screen.getByTestId('submit-button')
        await userEvent.click(submitButton)
        const requiredLabels = screen.getAllByText(/\*$/)
        requiredLabels.forEach(label => {
          const style = window.getComputedStyle(label)
          expect(style.color).toBe('rgb(224, 6, 31)')
        })
      })

      it('shows validation error for invalid email format', async () => {
        const emailInput = screen.getByTestId('email-input')
        const submitButton = screen.getByTestId('submit-button')
        await userEvent.type(emailInput, 'invalid-email')
        await userEvent.click(submitButton)
        const errorMessage = await screen.findByText('Please enter a valid email.')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('moves focus to the email input when validation fails', async () => {
      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)
      const emailInput = screen.getByTestId('email-input')
      expect(document.activeElement).toBe(emailInput)
    })
  })

  describe('user input', () => {
    it('allows user to enter an email', async () => {
      const emailInput = screen.getByTestId('email-input')
      await userEvent.type(emailInput, 'test@example.com')
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('trims whitespace from the email input', async () => {
      const emailInput = screen.getByTestId('email-input')
      await userEvent.type(emailInput, '  test@example.com  ')
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('navigation behavior', () => {
    it('navigates back to login when cancel button is clicked', async () => {
      const cancelButton = screen.getByTestId('cancel-button')
      await userEvent.click(cancelButton)
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SIGN_IN)
      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })

    it('renders the confirmation back button and navigates back to login after successful submission', async () => {
      ;(forgotPassword as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {requested: true},
      })
      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByTestId('submit-button')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)
      await waitFor(() => expect(screen.getByTestId('confirmation-heading')).toBeInTheDocument())
      const backButton = screen.getByTestId('confirmation-back-button')
      await userEvent.click(backButton)
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SIGN_IN)
      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })
  })

  describe('ui behavior', () => {
    it('displays the correct login handle label', () => {
      // this label is customizable by the end-user
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    })

    it('disables UI elements while the form is submitting and keeps the submit button disabled after success', async () => {
      ;(forgotPassword as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {requested: true},
      })
      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByTestId('submit-button')
      const cancelButton = screen.getByTestId('cancel-button')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)
      expect(submitButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      await waitFor(() => expect(screen.getByTestId('confirmation-heading')).toBeInTheDocument())
      expect(screen.getByTestId('confirmation-message')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('forgot password confirmation', () => {
    it('shows confirmation message after successful submission', async () => {
      ;(forgotPassword as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {requested: true},
      })
      const emailInput = screen.getByTestId('email-input')
      await userEvent.type(emailInput, 'test@example.com')
      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)
      await waitFor(() => expect(screen.getByTestId('confirmation-heading')).toBeInTheDocument())
      expect(screen.getByTestId('confirmation-message')).toBeInTheDocument()
      expect(screen.getByTestId('confirmation-message')).toHaveTextContent(
        'A recovery email has been sent to test@example.com. Please check your inbox and follow the instructions to reset your password. This may take up to 10 minutes. If you don’t receive an email, be sure to check your spam folder.',
      )
      expect(screen.getByTestId('confirmation-back-button')).toBeInTheDocument()
    })
  })

  describe('api interactions', () => {
    it('calls forgotPassword API with the entered email', async () => {
      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByTestId('submit-button')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)
      await waitFor(() => {
        expect(forgotPassword).toHaveBeenCalledWith('test@example.com')
      })
    })
  })
})
