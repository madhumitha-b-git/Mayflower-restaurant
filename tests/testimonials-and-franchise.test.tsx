import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestimonialsSection } from '../src/components/TestimonialsSection';
import { ContactSection } from '../src/components/ContactSection';
import { FranchiseEnquiryForm } from '../src/components/FranchiseEnquiryForm';
import { Footer } from '../src/components/Footer';
import { UserProfile } from '../src/types';

// Mock Supabase
vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
    }),
    channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
    removeChannel: vi.fn(),
  },
  isSupabaseConfigured: false,
}));

describe('TestimonialsSection Component', () => {
  it('renders section title, subtitle, and circular Mayflower emblem', () => {
    render(<TestimonialsSection />);
    
    expect(screen.getByText(/Testimonials/i)).toBeInTheDocument();
    expect(screen.getByText(/From our Visitors/i)).toBeInTheDocument();
    
    const emblemImg = screen.getByAltText(/The Mayflower/i);
    expect(emblemImg).toBeInTheDocument();
    expect(emblemImg).toHaveAttribute('src', '/mayflower-logo-badge.png');
  });

  it('renders the initial visitor review (Hellan White)', () => {
    render(<TestimonialsSection />);
    
    expect(screen.getByText(/Hellan White/i)).toBeInTheDocument();
    expect(screen.getByText(/The Mayflower - Poes garden/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Absolutely excellent. The music, combined with the pleasant atmosphere/i)
    ).toBeInTheDocument();
  });

  it('navigates to next and previous reviews using chevron buttons', () => {
    render(<TestimonialsSection />);
    
    const nextBtn = screen.getByLabelText(/Next testimonial/i);
    const prevBtn = screen.getByLabelText(/Previous testimonial/i);

    // Initial is Hellan White
    expect(screen.getByText(/Hellan White/i)).toBeInTheDocument();

    // Click next -> Street Smart
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Street Smart/i)).toBeInTheDocument();
    expect(screen.getByText(/The Mayflower: Palavakam/i)).toBeInTheDocument();

    // Click next -> Aaryan V Anand
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Aaryan V Anand/i)).toBeInTheDocument();
    expect(screen.getByText(/Mayflower, a restaurant near the beach/i)).toBeInTheDocument();

    // Click prev -> Back to Street Smart
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Street Smart/i)).toBeInTheDocument();
  });

  it('navigates directly via pagination dots', () => {
    render(<TestimonialsSection />);
    
    const dot3 = screen.getByLabelText(/Go to testimonial 3 of/i);
    fireEvent.click(dot3);

    expect(screen.getByText(/Aaryan V Anand/i)).toBeInTheDocument();
  });
});

describe('ContactSection Franchise Enquiry Button', () => {
  it('calls onOpenFranchise callback when clicking Franchise Enquiry', () => {
    const handleOpenFranchise = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <ContactSection
        onOpenModal={handleOpenModal}
        onOpenFranchise={handleOpenFranchise}
      />
    );

    const franchiseBtn = screen.getByRole('button', { name: /franchise enquiry/i });
    expect(franchiseBtn).toBeInTheDocument();

    fireEvent.click(franchiseBtn);
    expect(handleOpenFranchise).toHaveBeenCalledTimes(1);
    expect(handleOpenModal).not.toHaveBeenCalled();
  });
});

describe('FranchiseEnquiryForm Component Layout and Alignment', () => {
  const mockUser: UserProfile = {
    id: 'usr-franchise-1',
    name: 'Suresh Kumar',
    email: 'suresh@example.com',
    phone: '9876543210',
    rewardPoints: 100,
    tier: 'Gold',
    role: 'Customer',
    totalVisits: 3,
    joinedDate: '2025-01-01',
    transactions: [],
  };

  it('renders modal header, pre-populates authenticated user data, and includes all form fields', () => {
    const handleClose = vi.fn();

    render(<FranchiseEnquiryForm user={mockUser} onClose={handleClose} />);

    // Header check
    expect(screen.getByRole('heading', { name: /Franchise Enquiry/i })).toBeInTheDocument();
    expect(screen.getByText(/Partner with the Mayflower legacy/i)).toBeInTheDocument();

    // Pre-populated user data
    expect(screen.getByDisplayValue('Suresh Kumar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('suresh@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();

    // Aligned fields
    expect(screen.getByText(/Investment Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Hospitality Background/i)).toBeInTheDocument();
    expect(screen.getByText(/Prior F&B Experience\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Message \/ Background/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting Documents \(Optional\)/i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Enquiry/i })).toBeInTheDocument();
  });
});

describe('Instagram Connect Link & Logo', () => {
  it('renders Instagram link with correct URL in Footer Connect section', () => {
    const handleNavigate = vi.fn();
    const handlePlanVisit = vi.fn();

    render(<Footer onNavigate={handleNavigate} onPlanVisit={handlePlanVisit} />);

    const instagramLink = screen.getByLabelText(/Instagram/i);
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/themayflowerchennai/');
    expect(instagramLink).toHaveAttribute('target', '_blank');
  });

  it('renders Instagram link in ContactSection Connect area', () => {
    const handleOpenModal = vi.fn();

    render(<ContactSection onOpenModal={handleOpenModal} />);

    const instagramLink = screen.getByRole('link', { name: /@themayflowerchennai/i });
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/themayflowerchennai/');
    expect(instagramLink).toHaveAttribute('target', '_blank');
  });
});

