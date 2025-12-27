import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AdminLogin from '../AdminLogin'
import * as adminAuth from '../../services/adminAuth'

// Mock the adminAuth service
vi.mock('../../services/adminAuth', () => ({
  login: vi.fn()
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  const renderAdminLogin = () => {
    return render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    )
  }

  it('renders login form', () => {
    renderAdminLogin()
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter admin password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('disables submit button when password is empty', () => {
    renderAdminLogin()
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when password is entered', async () => {
    const user = userEvent.setup()
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(passwordInput, 'test-password')
    
    expect(submitButton).not.toBeDisabled()
  })

  it('calls login service on form submit', async () => {
    const user = userEvent.setup()
    adminAuth.login.mockResolvedValue({ success: true })
    
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(passwordInput, 'test-password')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(adminAuth.login).toHaveBeenCalledWith('test-password')
    })
  })

  it('navigates to /admin on successful login', async () => {
    const user = userEvent.setup()
    adminAuth.login.mockResolvedValue({ success: true })
    
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(passwordInput, 'test-password')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    adminAuth.login.mockResolvedValue({ 
      success: false, 
      error: 'Invalid password' 
    })
    
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    let resolveLogin
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })
    adminAuth.login.mockReturnValue(loginPromise)
    
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(passwordInput, 'test-password')
    await user.click(submitButton)
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    resolveLogin({ success: true })
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument()
    })
  })

  it('clears error when password changes', async () => {
    const user = userEvent.setup()
    adminAuth.login.mockResolvedValue({ 
      success: false, 
      error: 'Invalid password' 
    })
    
    renderAdminLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter admin password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    // First attempt - fails
    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument()
    })
    
    // Change password - error should clear
    await user.clear(passwordInput)
    await user.type(passwordInput, 'new-password')
    
    expect(screen.queryByText('Invalid password')).not.toBeInTheDocument()
  })

  it('has link back to home', () => {
    renderAdminLogin()
    
    const backLink = screen.getByText('← Back to home')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/')
  })
})

