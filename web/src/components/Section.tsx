interface SectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
        {title}
      </h2>
      <div className="text-gray-800">{children}</div>
    </section>
  )
}
