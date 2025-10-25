function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { height: 'h-10', text: 'text-xl' },
    md: { height: 'h-14', text: 'text-3xl' },
    lg: { height: 'h-20', text: 'text-4xl' }
  }

  const currentSize = sizes[size] || sizes.md

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Durin Logo Image */}
      <img 
        src="/assets/DurinLogo_nobg.png" 
        alt="Durin Logo" 
        className={`${currentSize.height} w-auto object-contain`}
      />
      
      {showText && (
        <div>
          <h1 className={`${currentSize.text} font-bold bg-gradient-to-r from-white via-accent-cyan to-accent-blue bg-clip-text text-transparent tracking-tight`}>
            DURIN
          </h1>
        </div>
      )}
    </div>
  )
}

export default Logo
