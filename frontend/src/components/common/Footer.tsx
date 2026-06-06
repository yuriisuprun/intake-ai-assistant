'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#1f2937', marginTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ color: '#d1d5db' }} className="text-sm text-center">
          <p>&copy; {currentYear} Intake Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
